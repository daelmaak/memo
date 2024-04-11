import { useSearchParams } from '@solidjs/router';
import { Component, JSX } from 'solid-js';
import { Button } from '~/components/ui/button';
import { isLoggedIn, sessionResource } from '~/domains/auth/auth-resource';
import { AccountButton } from '../domains/auth/AccountButton';
import { Lang, langs } from '../model/lang';
import { LangContext } from './language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Props {
  children?: JSX.Element;
}

const App: Component<Props> = props => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [session] = sessionResource;

  const loggedIn = () => isLoggedIn(session());

  const currentLang = () => (searchParams.lang as Lang) ?? 'pt';

  const changeLang = (value: string) => {
    setSearchParams({ lang: value as Lang });
  };

  return (
    <LangContext.Provider value={currentLang}>
      <nav class="flex items-center">
        <img src="/src/assets/logo.svg" alt="logo" class="size-8 mr-2" />
        <a href="/vocabulary">
          <Button class="text-inherit px-2" variant="link">
            Vocabulary
          </Button>
        </a>
        <a href="/conjugations">
          <Button class="text-inherit px-2" variant="link">
            Conjugations
          </Button>
        </a>
        <AccountButton loggedIn={!!loggedIn()} />
        <Select
          options={langs}
          value={currentLang()}
          onChange={lang => changeLang(lang)}
          itemComponent={props => (
            <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
          )}
        >
          <SelectTrigger class="h-8">
            <SelectValue<string>>{s => s.selectedOption()}</SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </nav>
      <main class="flex-grow w-full px-2 py-4 grid">{props.children}</main>
    </LangContext.Provider>
  );
};

export default App;
