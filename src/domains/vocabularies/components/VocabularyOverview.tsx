import { HiOutlinePlus } from 'solid-icons/hi';
import { Component, For, ResourceReturn, Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '~/components/ui/dialog';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { Skeleton } from '~/components/ui/skeleton';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyApi } from '../resources/vocabulary-api';
import { VocabularyList } from '../vocabulary-model';
import { VocabularyCard } from './VocabularyCard';
import { VocabularyCreator } from './VocabularyCreator';

export type Props = {
  fetchVocabularies: ResourceReturn<VocabularyList[]>;
  vocabularyApi: VocabularyApi;
  onTestVocabulary: (id: number) => void;
};

export const VocabularyOverview: Component<Props> = props => {
  const [vocabularies, vocabulariesAction] = props.fetchVocabularies;
  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(false);
  const [confirmDeletionOf, setConfirmDeletionOf] = createSignal<number>();

  const loading = () => vocabularies() == null;

  async function deleteVocabulary(listId: number) {
    const success = await props.vocabularyApi.deleteVocabularyList(listId);

    if (success) {
      vocabulariesAction.mutate(l => l?.filter(list => list.id !== listId));
    }
  }

  function onCloseDeletionDialog() {
    setConfirmDeletionOf(undefined);
  }

  async function onCreateVocabulary(name: string, words: WordTranslation[]) {
    const success = await props.vocabularyApi.createVocabularyList(name, words);

    if (success) {
      setCreateVocabularyOpen(false);
      vocabulariesAction.refetch();
    }

    return success;
  }

  async function onDeleteVocabulary() {
    const listId = confirmDeletionOf();
    setConfirmDeletionOf(undefined);

    if (listId == null) {
      return;
    }

    await deleteVocabulary(listId);
  }

  return (
    <div>
      <Show when={!loading()}>
        <div class="flex justify-between">
          <h1 class="text-xl font-bold mb-4">Your vocabulary lists</h1>
          <Button onClick={() => setCreateVocabularyOpen(true)}>
            <HiOutlinePlus size={20} /> Add vocabulary
          </Button>
          <Sheet
            open={createVocabularyOpen()}
            onOpenChange={open => setCreateVocabularyOpen(open)}
          >
            <SheetContent class="w-svw sm:w-[30rem]">
              <h2 class="text-lg font-bold mb-4">New vocabulary list</h2>
              <VocabularyCreator onListCreate={onCreateVocabulary} />
            </SheetContent>
          </Sheet>
        </div>

        <section class="h-full flex flex-col sm:grid sm:items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <For
            each={vocabularies()}
            fallback={
              <div class="m-auto" data-testid="empty-vocabulary-list">
                No vocabulary yet
              </div>
            }
          >
            {list => (
              <VocabularyCard
                list={list}
                onDeleteVocabulary={listId => setConfirmDeletionOf(listId)}
                onTestVocabulary={props.onTestVocabulary}
              />
            )}
          </For>
        </section>

        <Dialog
          open={confirmDeletionOf() != null}
          onOpenChange={onCloseDeletionDialog}
        >
          <DialogContent class="w-80">
            <DialogHeader>
              <h2 class="text-lg font-bold">You sure?</h2>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={onCloseDeletionDialog}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDeleteVocabulary}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Show>

      <Show when={loading()}>
        <div>
          <Skeleton class="mx-auto h-8 w-80" />
          <Skeleton class="mx-auto mt-4 h-12 w-20" />
        </div>
      </Show>
    </div>
  );
};
