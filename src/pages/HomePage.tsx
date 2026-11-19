import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Collection } from '../components/Collection';
import { Experience } from '../components/Experience';
import { About } from '../components/About';
import { Booking } from '../components/Booking';
import { Contact } from '../components/Contact';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle();
  const { hash, key } = useLocation();

  // Navegação por âncora vinda do menu ou de outra rota
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      // Move o foco para a seção sem pular a rolagem, para leitores de tela e teclado
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return (
    <>
      <Hero />
      <Collection />
      <Experience />
      <About />
      <Booking />
      <Contact />
    </>
  );
}
