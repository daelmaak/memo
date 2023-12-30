import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';

export interface WriteTesterProps {
  peek?: boolean;
  strict?: boolean;
  translation: string;
  validateOnBlur?: boolean;
  onDone?: () => void;
  onPeek?: () => void;
  onValidated?: (valid: boolean) => void;
}

export function WriteTester(props: WriteTesterProps) {
  let inputRef: HTMLInputElement | undefined;
  const [valid, setValid] = createSignal<boolean | undefined>();

  onMount(() => {
    inputRef?.focus();
  });

  // NOTE: executes always when props.translation changes
  createEffect(() => {
    if (inputRef) {
      inputRef.value = '';
    }
    setValid(undefined);
    return props.translation;
  });

  createEffect(() => {
    if (props.peek && valid() == null) {
      validateText();
    }
  });

  const tokenizedTranslation = createMemo(() => tokenize(props.translation));

  function validateText(): boolean {
    const text = inputRef?.value;

    if (!text) {
      props.onValidated?.(false);
      return false;
    }

    const tokenizedText = tokenize(text);
    const valid = tokenizedText.every(t =>
      // TODO: when the accents don't match, I should produce a warning
      tokenizedTranslation().some(tt =>
        props.strict ? tt === t : deaccent(tt) === deaccent(t)
      )
    );
    setValid(valid);

    props.onValidated?.(valid);

    return valid;
  }

  function onBlur() {
    if (!props.validateOnBlur || inputRef?.value === '') {
      return;
    }
    // Call onDone only once
    if (!valid() && validateText()) {
      props.onDone?.();
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();

    // Was already validated successfully before. So we can move on to the next word.
    if (valid()) {
      return props.onDone?.();
    }

    validateText();

    // NOTE: This handles the case where use resigned on giving an answer. So for his convenience, we let him submit which first
    // shows him the right answer and then it moves to next word on second submit.
    if (inputRef?.value === '') {
      if (props.peek) {
        props.onDone?.();
      } else {
        props.onPeek?.();
      }
    }
  }

  function tokenize(text: string) {
    return text.split(/[\s,\/]+/);
  }

  function deaccent(word: string) {
    return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  return (
    <form class="relative whitespace-nowrap" onSubmit={onSubmit}>
      <span
        class="absolute left-2 bottom-[-1.5rem] text-base"
        classList={{ invisible: !props.peek }}
      >
        {props.translation}
      </span>
      <input ref={inputRef} class="input w-56" type="text" onBlur={onBlur} />
      <button class="invisible" />
      <span class="inline-block ml-2 w-6">
        <Show when={valid() != null}>
          {valid() ? <i class="text-green-600">✓</i> : <i>❌</i>}
        </Show>
      </span>
    </form>
  );
}
