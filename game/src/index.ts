import { Modules } from "./modules/modules";
import { ConnectionsManager } from "./net/connections-manager";

Modules.init();
ConnectionsManager.createGameConnection();