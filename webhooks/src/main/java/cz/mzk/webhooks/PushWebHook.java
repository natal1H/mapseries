package cz.mzk.webhooks;

import cz.mzk.Settings;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.*;
import org.eclipse.jgit.internal.storage.file.FileRepository;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

@Path("/push")
public class PushWebHook {

    public static final Logger logger = Logger.getLogger(PushWebHook.class.getName());

    @POST
    public void onPush() {
        Settings settings = Settings.getInstance();
        String remoteRepo = settings.get("remote.repo", "https://github.com/moravianlibrary/mapseries.git");
        String localRepo = settings.get("local.repo", "/tmp/mapseries");

        if (repoExists(localRepo)) {
            pullRepo(localRepo);
        } else {
            cloneRepo(remoteRepo, localRepo);
        }
    }

    private boolean repoExists(String path) {
        File f = new File(path);
        return f.exists();
    }

    private void cloneRepo(String remote, String local) {
        logger.info(String.format("Creating directory: %s", local));
        // Create empty directory
        File localFile = new File(local);
        localFile.mkdirs();

        logger.info(String.format("Cloning repository %s to %s", remote, local));
        Git result = null;
        try {
            result = Git.cloneRepository()
                    .setURI(remote)
                    .setDirectory(localFile)
                    .call();
            logger.info("Cloning succesffuly done.");
        } catch (InvalidRemoteException e) {
            logger.severe(e.getMessage());
        } catch (TransportException e) {
            logger.severe(e.getMessage());
        } catch (GitAPIException e) {
            logger.severe(e.getMessage());
        } finally {
            if (result != null) {
                result.getRepository().close();
            }
        }
    }

    private void pullRepo(String repo) {
        logger.info(String.format("Pulling repository %s", repo));
        FileRepository repository = null;
        try {
            repository = new FileRepository(repo);
            Git git = new Git(repository);
            git.pull().call();
        } catch (IOException e) {
            logger.severe(e.getMessage());
        } catch (DetachedHeadException e) {
            logger.severe(e.getMessage());
        } catch (NoHeadException e) {
            logger.severe(e.getMessage());
        } catch (TransportException e) {
            logger.severe(e.getMessage());
        } catch (InvalidConfigurationException e) {
            logger.severe(e.getMessage());
        } catch (InvalidRemoteException e) {
            logger.severe(e.getMessage());
        } catch (CanceledException e) {
            logger.severe(e.getMessage());
        } catch (WrongRepositoryStateException e) {
            logger.severe(e.getMessage());
        } catch (RefNotFoundException e) {
            logger.severe(e.getMessage());
        } catch (GitAPIException e) {
            logger.severe(e.getMessage());
        } finally {
            if (repository != null) {
                repository.close();
            }
        }
    }
}
