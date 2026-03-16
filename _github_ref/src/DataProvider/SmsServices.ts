/* eslint-disable */

export interface ISendSmsPayload {
    phone: string;
    message: string;
}

export class SmsServices {

    private static CLICK_SEND_URL = "https://rest.clicksend.com/v3/sms/send";

    private username: string;
    private apiKey: string;
    private isSendSMS: boolean;

    constructor() {
        // ⚠️ Best practice:
        // move these to tenant properties / environment config
        this.username = "TretaInfotech";
        this.apiKey = "F31D8959-148F-145A-596F-DB7428016243";
        this.isSendSMS = true; // same as IsSendSMS flag in .NET
    }

    private getAuthHeader(): string {
        return "Basic " + btoa(`${this.username}:${this.apiKey}`);
    }

    public async sendSMSAsync(payload: ISendSmsPayload): Promise<void> {
        try {
            if (!this.isSendSMS) {
                return;
            }

            const body = {
                messages: [
                    {
                        source: "sdk",
                        from: "ClickSend",
                        body: payload.message,
                        to: payload.phone
                        // shorten_urls: true
                    }
                ]
            };

            const response = await fetch(SmsServices.CLICK_SEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": this.getAuthHeader()
                },
                body: JSON.stringify(body)
            });

            const responseText = await response.text();

            if (!response.ok) {
                console.error("=== SMS Sending ERROR ===");
                console.error("Status:", response.status);
                console.error("Body:", responseText);
                throw new Error(`SMS failed: ${response.status}`);
            }

        } catch (error) {
            console.error("SendSMSAsync error", error);
        }
    }
}