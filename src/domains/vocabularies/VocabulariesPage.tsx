import { useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';
import { getVocabulariesResource } from '~/domains/vocabularies/resources/vocabulary-resources';
import { isLoggedIn, sessionResource } from '../auth/auth-resource';
import { VocabularyOverview } from './components/VocabularyOverview';
import { AuthDialog } from '../auth/AuthDialog';
import { Button } from '~/components/ui/button';

export const VocabulariesPage = () => {
  const navigate = useNavigate();

  const [session] = sessionResource;
  const loggedIn = () => isLoggedIn(session());

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onTestVocabulary(id: number) {
    navigate(`/vocabulary/${id}/test`);
  }

  return (
    <>
      <Show when={loggedIn()}>
        <VocabularyOverview
          vocabulariesResource={getVocabulariesResource()}
          onGoToVocabulary={onGoToVocabulary}
          onTestVocabulary={onTestVocabulary}
        />
      </Show>
      <Show when={loggedIn() === false}>
        <div class="flex flex-col gap-4 justify-center items-center">
          You've got to sign in/sign up in order to create vocabularies.
          <AuthDialog
            mode="signin"
            trigger={<Button size="sm">Sign in</Button>}
          />
        </div>
      </Show>
    </>
  );
};