import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CompareTray } from './CompareTray';

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CompareTray />
      <ScrollRestoration
        getKey={(location) => (location.pathname === '/' ? '/' : location.key)}
      />
    </>
  );
}
