import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { site } from '../config/site';
import { useActiveSection } from '../hooks/useActiveSection';
import { useDialog } from '../hooks/useDialog';
import { useTheme } from '../hooks/useTheme';
import { Icon } from './Icon';
import styles from './Navbar.module.css';

const sectionIds = [...site.nav.map((n) => n.id), 'agendar'] as const;

export function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  // O menu fica aberto só enquanto a rota/âncora em que foi aberto continuar ativa
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menuOpen = menuKey === location.key;
  const active = useActiveSection(sectionIds, isHome);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const overHero = isHome && !scrolled && !menuOpen;
  const closeMenu = useCallback(() => setMenuKey(null), []);

  return (
    <header className={styles.header} data-over-hero={overHero || undefined} data-solid={!overHero || undefined}>
      <div className={styles.bar}>
        <Link to="/" className={styles.brand} aria-label={`${site.brand.name}, ${site.brand.descriptor}. Ir para o início`}>
          <span className={styles.wordmark}>{site.brand.name}</span>
          <span className={styles.descriptor}>{site.brand.descriptor}</span>
        </Link>

        <nav aria-label="Principal" className={styles.nav}>
          <ul className={styles.links}>
            {site.nav.map((item) => {
              const current = active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    to={{ pathname: '/', hash: `#${item.id}` }}
                    className={styles.link}
                    aria-current={current ? 'location' : undefined}
                  >
                    {item.label}
                    {current && <motion.span layoutId="nav-indicator" className={styles.indicator} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <Link to={{ pathname: '/', hash: '#agendar' }} className={`btn btn--small ${styles.cta}`} data-active={active === 'agendar' || undefined}>
            Agendar visita
          </Link>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.menuBtn}`}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label="Abrir menu"
            onClick={() => setMenuKey(location.key)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      <AnimatePresence>{menuOpen && <MobileMenu active={active} onClose={closeMenu} />}</AnimatePresence>
    </header>
  );
}

function MobileMenu({ active, onClose }: { active: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);

  return (
    <motion.div
      ref={ref}
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={styles.sheet}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className={styles.sheetTop}>
        <span className={styles.wordmark}>{site.brand.name}</span>
        <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fechar menu" data-autofocus>
          <Icon name="close" />
        </button>
      </div>
      <nav aria-label="Menu móvel">
        <ul className={styles.sheetLinks}>
          {site.nav.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={{ pathname: '/', hash: `#${item.id}` }}
                className={styles.sheetLink}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={onClose}
              >
                {item.label}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
      <Link to={{ pathname: '/', hash: '#agendar' }} className="btn btn--primary" onClick={onClose}>
        Agendar visita
      </Link>
    </motion.div>
  );
}
