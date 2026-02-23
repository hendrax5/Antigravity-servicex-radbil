import { Client, ClientChannel } from 'ssh2';

export class OltService {
    private conn: Client;
    private host: string;

    constructor(host: string) {
        this.host = host;
        this.conn = new Client();
    }

    // Connects to ZTE / Huawei OLTs
    async connect(username: string, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.conn.on('ready', () => {
                resolve(true);
            }).on('error', (err: Error) => {
                console.error(`[OLT SSH] Failed to connect to ${this.host}:`, err);
                reject(false);
            }).connect({
                host: this.host,
                port: 22,
                username: username,
                password: password,
                algorithms: {
                    // Legacy OLTs often require older cipher algorithms
                    kex: ['diffie-hellman-group1-sha1', 'diffie-hellman-group14-sha1', 'diffie-hellman-group-exchange-sha1', 'diffie-hellman-group-exchange-sha256'],
                    cipher: ['aes128-cbc', 'aes192-cbc', 'aes256-cbc', 'aes128-ctr', 'aes192-ctr', 'aes256-ctr']
                }
            });
        });
    }

    disconnect() {
        this.conn.end();
    }

    // Executes a raw SSH Command and returns the string output
    async executeCommand(cmd: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.conn.exec(cmd, (err: Error | undefined, stream: ClientChannel) => {
                if (err) return reject(err);

                let output = "";
                stream.on('close', () => {
                    resolve(output);
                }).on('data', (data: Buffer) => {
                    output += data.toString();
                }).stderr.on('data', (data: Buffer) => {
                    console.error('[OLT SSH] STDERR: ' + data);
                });
            });
        });
    }

    // ZTE Example: Parse 'show gpon ont optical-info'
    async getZteOpticalPower(gponPort: string, ontId: string): Promise<{ rx: string, tx: string, status: string }> {
        try {
            // "show gpon ont optical-info gpon-olt_1/2/3 1"
            const cmd = `show gpon ont optical-info ${gponPort} ${ontId}`;
            const rawOutput = await this.executeCommand(cmd);

            // Using RegEx to parse typical ZTE output tables
            // Example match: "Rx optical power(dBm)                 : -19.45"
            const rxMatch = rawOutput.match(/Rx optical power\s*\(dBm\)\s*:\s*(-\d+\.\d+)/i);
            const txMatch = rawOutput.match(/Tx optical power\s*\(dBm\)\s*:\s*(\d+\.\d+)/i);

            const rx = rxMatch ? rxMatch[1] : "N/A";
            const tx = txMatch ? txMatch[1] : "N/A";

            // If RX is extremely low (e.g., -40), it's a Loss of Signal (Fiber Cut)
            let status = "NORMAL";
            if (rx !== "N/A" && parseFloat(rx) <= -30.0) {
                status = "LOS ALARM";
            } else if (rx === "N/A") {
                status = "OFFLINE";
            }

            return { rx, tx, status };
        } catch (e) {
            console.error("[OLT SSH] getZteOpticalPower error:", e);
            return { rx: "ERROR", tx: "ERROR", status: "UNREACHABLE" };
        }
    }
}
