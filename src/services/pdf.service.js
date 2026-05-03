import PDFDocument from 'pdfkit';

class PDFService {
    /**
     * Genera un PDF en memoria y devuelve un Buffer[cite: 1]
     */
    async generateDeliveryNotePDF(deliveryNote) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // --- Cabecera ---
                doc.fontSize(20).text('ALBARÁN DE TRABAJO', { align: 'center' });
                doc.moveDown();

                doc.fontSize(12)
                    .text(`ID Albarán: ${deliveryNote._id}`)
                    .text(`Fecha de Trabajo: ${deliveryNote.workDate.toLocaleDateString()}`)
                    .text(`Estado: ${deliveryNote.signed ? 'FIRMADO' : 'PENDIENTE DE FIRMA'}`);
                doc.moveDown();

                // --- Datos de la Empresa y Cliente ---
                doc.text(`Empresa Emisora: ${deliveryNote.company.name}`); // Asume que se ha hecho populate de company
                doc.text(`Cliente: ${deliveryNote.client.name} (CIF: ${deliveryNote.client.cif})`);
                doc.text(`Proyecto: ${deliveryNote.project.name} (${deliveryNote.project.projectCode})`);
                doc.moveDown();

                // --- Detalles del Trabajo ---
                doc.fontSize(14).text('Detalles del Trabajo', { underline: true });
                doc.fontSize(12).text(`Descripción: ${deliveryNote.description}`);
                doc.moveDown();

                if (deliveryNote.format === 'material') {
                    doc.text(`Tipo: Entrega de Materiales`);
                    doc.text(`Material: ${deliveryNote.material}`);
                    doc.text(`Cantidad: ${deliveryNote.quantity} ${deliveryNote.unit}`);
                } else {
                    doc.text(`Tipo: Horas de Trabajo`);
                    if (deliveryNote.hours) {
                        doc.text(`Total Horas: ${deliveryNote.hours}`);
                    }
                    if (deliveryNote.workers && deliveryNote.workers.length > 0) {
                        doc.moveDown().text('Desglose por trabajador:');
                        deliveryNote.workers.forEach(worker => {
                            doc.text(`- ${worker.name}: ${worker.hours} horas`, { indent: 20 });
                        });
                    }
                }

                // --- Firma (Si existe) ---
                if (deliveryNote.signed && deliveryNote.signatureUrl) {
                    doc.moveDown(3);
                    doc.fontSize(14).text('Firma de Conformidad:', { align: 'center' });
                    doc.moveDown();

                    // Nota: Para insertar la imagen desde una URL de Cloudinary en PDFKit de forma síncrona,
                    // tendríamos que descargarla primero mediante 'fetch'.
                    // Para simplificar este servicio y no bloquear la respuesta, añadiremos la URL.
                    doc.fontSize(10).text('Documento firmado digitalmente.', { align: 'center' });
                    doc.text(`URL de la firma original:`, { align: 'center' });
                    doc.fillColor('blue').text(deliveryNote.signatureUrl, { align: 'center', link: deliveryNote.signatureUrl });
                    doc.fillColor('black');

                    doc.moveDown().text(`Fecha de firma: ${deliveryNote.signedAt.toLocaleString()}`, { align: 'center' });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default new PDFService();