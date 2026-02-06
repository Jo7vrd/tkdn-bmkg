// controllers/evaluationController.js
import pool from '../config/database.js';

/**
 * POST /api/evaluations
 * Create new evaluation with documents and items
 */
export const createEvaluation = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { ppkData, documents, items } = req.body;
    const userId = req.user.id;

    // Generate sequential ID
    const year = new Date().getFullYear();
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM evaluations WHERE id LIKE $1",
      [`TKDN-${year}-%`]
    );
    const nextNumber = parseInt(countResult.rows[0].count) + 1;
    const evaluationId = `TKDN-${year}-${String(nextNumber).padStart(3, '0')}`;

    // 1. Insert evaluation
    await client.query(
      `INSERT INTO evaluations (
        id, user_id, status,
        ppk_nama, ppk_nip, ppk_no_hp, ppk_email, ppk_unit_kerja, ppk_jabatan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        evaluationId,
        userId,
        'pending',
        ppkData.nama_ppk,
        ppkData.nip,
        ppkData.no_hp,
        ppkData.email,
        ppkData.unit_kerja,
        ppkData.jabatan,
      ]
    );

    // 2. Insert documents (convert base64 to BYTEA)
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        const base64Data = doc.base64.split(',')[1] || doc.base64;
        const binaryData = Buffer.from(base64Data, 'base64');

        await client.query(
          `INSERT INTO evaluation_documents (
            evaluation_id, document_type, file_name, file_size, file_type, file_data
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [evaluationId, doc.type, doc.name, doc.size, 'application/pdf', binaryData]
        );
      }
    }

    // 3. Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        // Calculate TKDN if not provided
        const finalPrice = parseFloat(item.final_price || item.finalPrice) || 0;
        const foreignPrice = parseFloat(item.foreign_price || item.foreignPrice) || 0;
        const bmp = parseFloat(item.bmp || item.bmpValue) || 0;
        
        // Calculate TKDN: (Harga Jadi - Komponen Asing) / Harga Jadi * 100
        const tkdn = item.tkdn || item.tkdnValue || (finalPrice > 0 ? ((finalPrice - foreignPrice) / finalPrice) * 100 : 0);
        
        await client.query(
          `INSERT INTO evaluation_items (
            evaluation_id, item_name, quantity, unit, brand, model,
            specifications, category, final_price, foreign_price, bmp, tkdn, status, regulation
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            evaluationId,
            item.item_name || item.itemName,
            item.quantity,
            item.unit,
            item.brand,
            item.model,
            item.specifications,
            item.category,
            finalPrice,
            foreignPrice,
            bmp,
            tkdn,
            item.status,
            typeof item.regulation === 'string' ? item.regulation : JSON.stringify(item.regulation),
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Evaluasi berhasil disimpan ke server',
      data: { id: evaluationId },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan evaluasi',
      error: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * GET /api/evaluations
 * Get all evaluations (user: own only, admin: all)
 */
export const getEvaluations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = 'SELECT * FROM evaluations';
    const params = [];

    // Filter by user if not admin
    if (userRole !== 'admin') {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    query += ' ORDER BY submitted_at DESC';

    const evaluationsResult = await pool.query(query, params);

    // For each evaluation, get items and documents
    const evaluations = await Promise.all(
      evaluationsResult.rows.map(async (evaluation) => {
        // Get items
        const itemsResult = await pool.query(
          'SELECT * FROM evaluation_items WHERE evaluation_id = $1',
          [evaluation.id]
        );

        // Get documents (metadata only, no binary data)
        const documentsResult = await pool.query(
          `SELECT id, document_type, file_name, file_size, file_type, uploaded_at,
                  justification_status, justification_reviewed_at, 
                  justification_reviewed_by, justification_rejection_reason
           FROM evaluation_documents WHERE evaluation_id = $1`,
          [evaluation.id]
        );

        return {
          ...evaluation,
          items: itemsResult.rows,
          documents: documentsResult.rows,
        };
      })
    );

    res.json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    console.error('❌ Error getting evaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data evaluasi',
      error: error.message,
    });
  }
};

/**
 * GET /api/evaluations/:id
 * Get single evaluation with documents and items
 */
export const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get evaluation
    let evaluationQuery = 'SELECT * FROM evaluations WHERE id = $1';
    const params = [id];

    // Check permission
    if (userRole !== 'admin') {
      evaluationQuery += ' AND user_id = $2';
      params.push(userId);
    }

    const evaluationResult = await pool.query(evaluationQuery, params);

    if (evaluationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi tidak ditemukan',
      });
    }

    // Get documents (without binary data for list)
    const documentsResult = await pool.query(
      `SELECT id, document_type, file_name, file_size, file_type, uploaded_at,
              justification_status, justification_reviewed_at, 
              justification_reviewed_by, justification_rejection_reason
       FROM evaluation_documents WHERE evaluation_id = $1`,
      [id]
    );

    // Get items
    const itemsResult = await pool.query(
      'SELECT * FROM evaluation_items WHERE evaluation_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...evaluationResult.rows[0],
        documents: documentsResult.rows,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('❌ Error getting evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data evaluasi',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/evaluations/:id/status
 * Update evaluation status (admin only)
 */
export const updateEvaluationStatus = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengupdate status.',
      });
    }

    const { id } = req.params;
    const { status, reviewNotes, rejectionReason, presentationDate } = req.body;

    // Validate status
    const validStatuses = ['pending', 'under_review', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid',
      });
    }

    const now = new Date().toISOString();
    let updateFields = ['status = $1', 'reviewed_at = $2', 'reviewed_by = $3'];
    let params = [status, now, req.user.nama || 'Admin'];

    // Add status-specific fields
    if (status === 'accepted') {
      updateFields.push('accepted_at = $' + (params.length + 1));
      params.push(now);

      if (presentationDate) {
        updateFields.push('presentation_date = $' + (params.length + 1));
        params.push(presentationDate);
      }
    } else if (status === 'rejected') {
      updateFields.push('rejected_at = $' + (params.length + 1));
      params.push(now);

      if (rejectionReason) {
        updateFields.push('rejection_reason = $' + (params.length + 1));
        params.push(rejectionReason);
      }
    }

    if (reviewNotes) {
      updateFields.push('review_notes = $' + (params.length + 1));
      params.push(reviewNotes);
    }

    params.push(id);

    const query = `
      UPDATE evaluations 
      SET ${updateFields.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Status evaluasi berhasil diupdate',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate status',
      error: error.message,
    });
  }
};

/**
 * GET /api/evaluations/:evaluationId/documents/:documentId
 * Download document file
 */
export const getDocument = async (req, res) => {
  try {
    const { evaluationId, documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if user has access to this evaluation
    if (userRole !== 'admin') {
      const evaluationResult = await pool.query(
        'SELECT user_id FROM evaluations WHERE id = $1',
        [evaluationId]
      );

      if (evaluationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Evaluasi tidak ditemukan',
        });
      }

      if (evaluationResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak',
        });
      }
    }

    // Get document with binary data
    const documentResult = await pool.query(
      `SELECT file_name, file_type, file_data 
       FROM evaluation_documents 
       WHERE id = $1 AND evaluation_id = $2`,
      [documentId, evaluationId]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan',
      });
    }

    const document = documentResult.rows[0];

    // Set headers
    res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    
    // Send binary data
    res.send(document.file_data);
  } catch (error) {
    console.error('❌ Error getting document:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dokumen',
      error: error.message,
    });
  }
};

/**
 * POST /api/evaluations/:id/justification
 * Upload justification document for accepted evaluation
 */
export const uploadJustificationDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { fileName, fileSize, fileType, fileData } = req.body;

    // Verify evaluation belongs to user and is accepted
    const evaluationResult = await pool.query(
      'SELECT user_id, status FROM evaluations WHERE id = $1',
      [id]
    );

    if (evaluationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi tidak ditemukan',
      });
    }

    const evaluation = evaluationResult.rows[0];

    if (evaluation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak',
      });
    }

    if (evaluation.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Dokumen justifikasi hanya dapat diunggah untuk pengajuan yang disetujui',
      });
    }

    // Convert base64 to binary
    const base64Data = fileData.split(',')[1] || fileData;
    const binaryData = Buffer.from(base64Data, 'base64');

    // Delete old justification document if exists (for revision)
    await pool.query(
      `DELETE FROM evaluation_documents 
       WHERE evaluation_id = $1 AND document_type = 'justification'`,
      [id]
    );

    // Insert new justification document with pending status
    const result = await pool.query(
      `INSERT INTO evaluation_documents (
        evaluation_id, document_type, file_name, file_size, file_type, file_data,
        justification_status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id`,
      [id, 'justification', fileName, fileSize, fileType, binaryData]
    );

    res.status(201).json({
      success: true,
      message: 'Dokumen justifikasi berhasil diunggah',
      data: {
        documentId: result.rows[0].id,
      },
    });
  } catch (error) {
    console.error('❌ Error uploading justification document:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengunggah dokumen justifikasi',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/evaluations/:id/justification/review
 * Review justification document (admin only)
 */
export const reviewJustificationDocument = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mereview dokumen.',
      });
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Gunakan "approved" atau "rejected".',
      });
    }

    // If rejected, reason is required
    if (status === 'rejected' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan harus diisi.',
      });
    }

    // Check if evaluation exists
    const evaluationResult = await pool.query(
      'SELECT id FROM evaluations WHERE id = $1',
      [id]
    );

    if (evaluationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Evaluasi tidak ditemukan',
      });
    }

    // Find justification document
    const documentResult = await pool.query(
      `SELECT id FROM evaluation_documents 
       WHERE evaluation_id = $1 AND document_type = 'justification'
       ORDER BY uploaded_at DESC
       LIMIT 1`,
      [id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen justifikasi tidak ditemukan',
      });
    }

    const documentId = documentResult.rows[0].id;
    const now = new Date().toISOString();

    // Update document with review status
    const updateQuery = status === 'approved'
      ? `UPDATE evaluation_documents 
         SET justification_status = $1, 
             justification_reviewed_at = $2,
             justification_reviewed_by = $3
         WHERE id = $4
         RETURNING *`
      : `UPDATE evaluation_documents 
         SET justification_status = $1, 
             justification_rejection_reason = $2,
             justification_reviewed_at = $3,
             justification_reviewed_by = $4
         WHERE id = $5
         RETURNING *`;

    const params = status === 'approved'
      ? [status, now, req.user.nama || 'Admin', documentId]
      : [status, reason, now, req.user.nama || 'Admin', documentId];

    const result = await pool.query(updateQuery, params);

    res.json({
      success: true,
      message: `Dokumen justifikasi berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error reviewing justification document:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mereview dokumen justifikasi',
      error: error.message,
    });
  }
};

