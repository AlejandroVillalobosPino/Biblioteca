import { IncomingWebhook } from '@slack/webhook';

// Asegúrate de poner tu SLACK_WEBHOOK en el archivo .env[cite: 6]
const webhook = process.env.SLACK_WEBHOOK
    ? new IncomingWebhook(process.env.SLACK_WEBHOOK)
    : null;

export const sendSlackNotification = async (errorData) => {
    if (!webhook) return; // Si no hay webhook configurado, no hacemos nada

    const message = {
        text: `*¡ERROR 5XX DETECTADO EN BILDYAPP!*`,
        attachments: [
            {
                color: '#FF0000',
                fields: [
                    { title: 'Fecha', value: new Date().toISOString(), short: true },
                    { title: 'Método y Ruta', value: `${errorData.method} ${errorData.url}`, short: true },
                    { title: 'Mensaje', value: errorData.message, short: false },
                    { title: 'Stack Trace', value: `\`\`\`${errorData.stack.substring(0, 1000)}\`\`\``, short: false }
                ]
            }
        ]
    };

    try {
        await webhook.send(message);
    } catch (err) {
        console.error('Error al intentar enviar el log a Slack:', err);
    }
};