import { RouterOSAPI } from "node-routeros";

export class MikrotikService {
    private conn: RouterOSAPI;
    private host: string;
    private isConnected: boolean = false;

    constructor(host: string, user: string, pass: string, port: number = 8728) {
        this.host = host;
        this.conn = new RouterOSAPI({
            host: host,
            user: user,
            password: pass,
            port: port,
            timeout: 5000
        });
    }

    async connect(): Promise<boolean> {
        try {
            await this.conn.connect();
            this.isConnected = true;
            return true;
        } catch (error) {
            console.error(`[MikroTik] Failed to connect to ${this.host}:`, error);
            return false;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            this.conn.close();
            this.isConnected = false;
        }
    }

    // Generic command proxy for APIs that need advanced reads
    async writeCommand(command: string, args: string[] = []) {
        if (!this.isConnected) await this.connect();
        try {
            return await this.conn.write(command, args);
        } catch (error) {
            console.error(`[MikroTik] Command ${command} failed:`, error);
            return [];
        }
    }

    // NMS: Check Router Interfaces Traffic
    async getInterfaces() {
        if (!this.isConnected) await this.connect();
        try {
            return await this.conn.write("/interface/print");
        } catch (error) {
            console.error("[MikroTik] getInterfaces error:", error);
            return [];
        }
    }

    // Auto-Isolir: Set PPPoE Secret Profile to ISOLIR
    async setPppoeProfile(username: string, profileName: string) {
        if (!this.isConnected) await this.connect();
        try {
            // Find the internal ID of the secret
            const secrets = await this.conn.write("/ppp/secret/print", [`?name=${username}`]);
            if (secrets.length > 0) {
                const id = secrets[0][".id"];
                await this.conn.write("/ppp/secret/set", [`=.id=${id}`, `=profile=${profileName}`]);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[MikroTik] setPppoeProfile error for ${username}:`, error);
            return false;
        }
    }

    // QoS: Set Simple Queue Limit
    async setSimpleQueue(username: string, maxLimit: string) {
        if (!this.isConnected) await this.connect();
        try {
            const queues = await this.conn.write("/queue/simple/print", [`?name=${username}`]);
            if (queues.length > 0) {
                const id = queues[0][".id"];
                await this.conn.write("/queue/simple/set", [`=.id=${id}`, `=max-limit=${maxLimit}`]);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[MikroTik] setSimpleQueue error for ${username}:`, error);
            return false;
        }
    }

    // NMS: Print OSPF Neighbors
    async getOspfNeighbors() {
        if (!this.isConnected) await this.connect();
        try {
            return await this.conn.write("/routing/ospf/neighbor/print");
        } catch (e) {
            return [];
        }
    }

    // Sessions: Active PPPoE Users
    async getActivePppoeSessions() {
        if (!this.isConnected) await this.connect();
        try {
            return await this.conn.write("/ppp/active/print");
        } catch (e) {
            console.error("[MikroTik] getActivePppoeSessions error:", e);
            return [];
        }
    }

    // Sessions: Active Hotspot Users
    async getActiveHotspotSessions() {
        if (!this.isConnected) await this.connect();
        try {
            return await this.conn.write("/ip/hotspot/active/print");
        } catch (e) {
            console.error("[MikroTik] getActiveHotspotSessions error:", e);
            return [];
        }
    }
}
