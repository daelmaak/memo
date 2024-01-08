import { Show } from 'solid-js';
import { WordTranslation } from '../../parser/simple-md-parser';

interface ResultsProps {
  invalidWords?: WordTranslation[];
  removedWords?: WordTranslation[];
  words?: WordTranslation[];
  repeat: () => void;
  reset: () => void;
  tryInvalidWords: (invalidWords: WordTranslation[]) => void;
}

export function Results(props: ResultsProps) {
  let invalidWordsRef: HTMLTextAreaElement | undefined;

  function copyInvalidWords() {
    if (!invalidWordsRef) {
      return;
    }

    invalidWordsRef.select();
    navigator.clipboard.writeText(invalidWordsRef.value);
    // TODO: @daelmaak show feedback about the copy
  }

  function copyNotRemovedWords() {
    if (!props.removedWords || !props.words) {
      return;
    }

    const notRemovedWords = props.words.filter(w =>
      props.removedWords!.every(r => r.original !== w.original)
    );
    navigator.clipboard.writeText(formatWords(notRemovedWords));
    // TODO: @daelmaak show feedback about the copy
  }

  function formatWords(words: WordTranslation[]) {
    return words.reduce(
      (acc, w) => acc + `${w.original} - ${w.translation}` + '\n',
      ''
    );
  }

  return (
    <>
      <p class="text-center text-2xl">
        <i class="mr-4 text-green-600 font-semibold">✓</i>Done!
      </p>
      <div class="mx-auto mt-8 text-center">
        <button class="btn-primary" onClick={props.repeat}>
          Again
        </button>
        <button class="btn-link ml-4" onClick={props.reset}>
          Pick different words
        </button>
      </div>
      <Show when={props.invalidWords} keyed>
        {invalidWords =>
          invalidWords.length > 0 && (
            <section class="mx-auto mt-10 flex flex-col">
              <h2 class="mb-4 text-lg text-center">
                Words you had hard time guessing or didn't manage:
              </h2>
              <textarea
                class="input text-center"
                name="invalid-words"
                ref={invalidWordsRef}
                rows="5"
                value={formatWords(invalidWords)}
              ></textarea>
              <div class="mx-auto mt-2">
                <button
                  class="btn-link"
                  type="button"
                  onClick={() => props.tryInvalidWords(invalidWords)}
                >
                  Practice them
                </button>
                <button
                  class="btn-link ml-4"
                  type="button"
                  onClick={copyInvalidWords}
                >
                  Copy
                </button>
              </div>
            </section>
          )
        }
      </Show>
      <Show when={props.removedWords} keyed>
        {removedWords =>
          removedWords.length > 0 && (
            <section class="mx-auto mt-10 flex flex-col">
              <h2 class="mb-4 text-lg text-center">
                Words you decided to remove
              </h2>
              <textarea
                class="input text-center"
                name="removed-words"
                rows="5"
                value={formatWords(removedWords)}
              ></textarea>
              <div class="mx-auto mt-2">
                <button
                  class="btn-link ml-4"
                  type="button"
                  onClick={copyNotRemovedWords}
                >
                  Copy the ones left
                </button>
              </div>
            </section>
          )
        }
      </Show>
    </>
  );
}
