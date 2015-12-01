package cz.mzk.tools;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.*;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;

public class Github {

    public static final Logger logger = LoggerFactory.getLogger(Github.class);

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
            logger.error(e.getMessage(), e);
        } catch (TransportException e) {
            logger.error(e.getMessage(), e);
        } catch (GitAPIException e) {
            logger.error(e.getMessage(), e);
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
            logger.error(e.getMessage(), e);
        } catch (DetachedHeadException e) {
            logger.error(e.getMessage(), e);
        } catch (NoHeadException e) {
            logger.error(e.getMessage(), e);
        } catch (TransportException e) {
            logger.error(e.getMessage(), e);
        } catch (InvalidConfigurationException e) {
            logger.error(e.getMessage(), e);
        } catch (InvalidRemoteException e) {
            logger.error(e.getMessage(), e);
        } catch (CanceledException e) {
            logger.error(e.getMessage(), e);
        } catch (WrongRepositoryStateException e) {
            logger.error(e.getMessage(), e);
        } catch (RefNotFoundException e) {
            logger.error(e.getMessage(), e);
        } catch (GitAPIException e) {
            logger.error(e.getMessage(), e);
        } finally {
            if (repository != null) {
                repository.close();
            }
        }
    }

}
