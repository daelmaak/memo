import { supabase } from '~/lib/supabase-client';
import { RealOmit, omit } from '~/util/object';
import { VocabularyItem, Vocabulary } from '../vocabulary-model';

export type VocabularyItemToCreate = RealOmit<VocabularyItem, 'id' | 'list_id'>;
export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'vocabularyItems'
> & {
  vocabularyItems: VocabularyItemToCreate[];
};

const fetchVocabularyLists = async () => {
  const result = await supabase.from('vocabularies').select(
    `
    id, 
    country,
    name,
    vocabulary_items (
      id,
      list_id,
      original,
      translation
    )`
  );

  return (result.data ?? []).map(lists => ({
    id: lists.id,
    country: lists.country,
    name: lists.name,
    vocabularyItems: lists.vocabulary_items,
  }));
};

const createVocabularyList = async (vocabulary: VocabularyToCreate) => {
  const listResult = await supabase
    .from('vocabularies')
    .insert({ ...omit(vocabulary, 'vocabularyItems') })
    .select();

  if (listResult.error) {
    return false;
  }

  const createdList = listResult.data?.[0];

  const attachedWords = vocabulary.vocabularyItems.map(word => ({
    ...word,
    list_id: createdList?.id,
  }));

  const itemsResult = await supabase
    .from('vocabulary_items')
    .insert(attachedWords);

  return !itemsResult.error;
};

const deleteVocabularyList = async (id: number) => {
  const result = await supabase.from('vocabularies').delete().match({ id });

  return !result.error;
};

const updateVocabularyItems = async (items: VocabularyItem[]) => {
  const result = await supabase.from('vocabulary_items').upsert(items);

  return !result.error;
};

export const vocabularyApi = {
  fetchVocabularyLists,
  createVocabularyList,
  deleteVocabularyList,
  updateVocabularyItems,
};

export type VocabularyApi = typeof vocabularyApi;
