/* eslint-disable eqeqeq */
import { WebPartContext } from "@microsoft/sp-webpart-base";

// import pnp and pnp logging system
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import "@pnp/sp/site-users/web";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/items/get-all";
import "@pnp/sp/attachments";
import "@pnp/sp/fields";
import "@pnp/sp/sharing";
import "@pnp/sp/sites";
import "@pnp/sp/profiles";
import "@pnp/sp/presets/all";
import "@pnp/sp/views";
import "@pnp/sp/security";


// eslint-disable-next-line no-var
let _sp: SPFI;

export const getSP = (context?: WebPartContext): SPFI => {
    if (context != null) {
        // eslint-disable-line eqeqeq
        _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
    }
    return _sp;
};