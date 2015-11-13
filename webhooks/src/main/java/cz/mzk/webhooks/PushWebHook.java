package cz.mzk.webhooks;

import cz.mzk.tools.FormatTransformer;
import cz.mzk.tools.Github;

import javax.ws.rs.POST;
import javax.ws.rs.Path;

@Path("/push")
public class PushWebHook {

    @POST
    public synchronized void onPush() {

        Github.cloneRepo();

        FormatTransformer.transform();

    }
}
