import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Show, Suspense, createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { BackLink } from '~/components/BackLink';
import type { VocabularyItem } from '../vocabularies/model/vocabulary-model';
import {
  deleteVocabularyItems,
  deleteVocabularyProgress,
  fetchVocabulary,
  saveVocabularyProgress,
  updateVocabularyAsInteractedWith,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';
import type { TestResultWord } from '../vocabulary-results/model/test-result-model';
import { saveTestResult } from '../vocabulary-results/resources/vocabulary-test-result-resource';
import type { VocabularyTesterSettings } from './components/VocabularySettings';
import { VocabularySettings } from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';
import { createQuery } from '@tanstack/solid-query';

export const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const vocabularyId = +params.id;

  const vocabularyQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyTesterSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
      strictMatch: false,
    });
  const [words, setWords] = createSignal<VocabularyItem[]>();

  createEffect(() => {
    const vocabulary = vocabularyQuery.data;

    if (vocabulary) {
      void updateVocabularyAsInteractedWith(vocabulary.id);
    }

    setInitialWords();
  });

  function setInitialWords() {
    // Vocabulary loading means the current one is either non existent or stale
    // so now words should be set at this moment.
    if (vocabularyQuery.isLoading) {
      return;
    }

    const vocabulary = vocabularyQuery.data;

    if (vocabulary == null) {
      return;
    }

    if (searchParams.wordIds) {
      const wordIds = searchParams.wordIds.split(',').map(Number);
      const words = vocabulary.vocabularyItems.filter(w =>
        wordIds.includes(w.id)
      );
      setWords(words);
    } else {
      setWords(vocabulary.vocabularyItems);
    }
  }

  async function onDone(results: TestResultWord[]) {
    void deleteVocabularyProgress(vocabularyId);
    await saveTestResult({
      vocabularyId,
      done: true,
      words: results,
    });
    navigate('results');
  }

  function onEditWord(word: VocabularyItem) {
    void updateVocabularyItems(word);
  }

  function goToVocabulary() {
    navigate('..');
  }

  async function deleteWord(word: VocabularyItem) {
    await deleteVocabularyItems(vocabularyId, word.id);
  }

  function saveProgress(results: TestResultWord[]) {
    void saveVocabularyProgress({
      done: false,
      vocabularyId,
      words: results,
    });
  }

  return (
    <div class="page-container h-full">
      <Suspense>
        <BackLink>Back to vocabulary</BackLink>
        <Show when={vocabularyId} keyed>
          <Show when={words()}>
            {w => (
              <div class="mt-8 grid sm:grid-cols-[1fr_2fr_1fr]">
                <aside class="p-4 order-1 sm:order-none">
                  <h2 class="mb-4">Test Settings</h2>
                  <VocabularySettings
                    settings={vocabularySettings}
                    onChange={setVocabularySettings}
                  />
                </aside>
                <main class="m-auto mb-4">
                  <VocabularyTester
                    testSettings={vocabularySettings}
                    savedProgress={
                      searchParams.useSavedProgress
                        ? vocabularyQuery.data?.savedProgress?.words
                        : undefined
                    }
                    words={w()}
                    onDone={onDone}
                    onEditWord={onEditWord}
                    onProgress={saveProgress}
                    onRemoveWord={deleteWord}
                    onStop={goToVocabulary}
                  />
                </main>
              </div>
            )}
          </Show>
        </Show>
      </Suspense>
    </div>
  );
};
