package cz.mzk.tools;

import cz.mzk.settings.Settings;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.*;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;

import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

public class Github {

    public static final Logger logger = Logger.getLogger(Github.class.getName());

    private static final Settings settings = Settings.getInstance();

    public static void cloneRepo() {
        String remoteRepo = settings.getRemoteRepo();
        String localRepo = settings.getLocalRepo();

        if (repoExists(localRepo)) {
            pullRepo(localRepo);
        } else {
            cloneRepo(remoteRepo, localRepo);
        }
    }

    private static boolean repoExists(String path) {
        File f = new File(path);
        return f.exists();
    }

    private static void cloneRepo(String remote, String local) {
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

    private static void pullRepo(String repo) {
        logger.info(String.format("Pulling repository %s", repo));
        FileRepositoryBuilder builder = new FileRepositoryBuilder();
        Repository repository = null;
        try {
            repository = builder.setGitDir(new File(repo + "/.git")).readEnvironment().findGitDir().build();
            Git git = new Git(repository);
            git.pull().call();
            logger.info("Pulling succesffuly done.");
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
