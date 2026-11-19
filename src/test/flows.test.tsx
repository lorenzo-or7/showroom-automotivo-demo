import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../hooks/useTheme';
import { CompareProvider } from '../hooks/useCompare';
import { Collection } from '../components/Collection';
import { Booking } from '../components/Booking';
import { Navbar } from '../components/Navbar';
import ComparePage from '../pages/ComparePage';
import VehiclePage from '../pages/VehiclePage';
import { site } from '../config/site';

function renderAt(element: ReactNode, path = '/', routePath = '/') {
  const router = createMemoryRouter([{ path: routePath, element }], { initialEntries: [path] });
  render(
    <ThemeProvider>
      <CompareProvider>
        <RouterProvider router={router} />
      </CompareProvider>
    </ThemeProvider>,
  );
  return router;
}

describe('coleção', () => {
  it('busca, mostra contador, estado vazio e limpa filtros', async () => {
    const user = userEvent.setup();
    const router = renderAt(<Collection />);
    expect(screen.getByText(/de 10 veículos/)).toHaveTextContent('10 de 10 veículos');

    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'porsche');
    expect(screen.getByText(/de 10 veículos/)).toHaveTextContent('2 de 10 veículos');
    expect(router.state.location.search).toContain('q=porsche');

    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), ' inexistente');
    expect(screen.getByText(/Nada por aqui/)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);
    expect(screen.getByText(/de 10 veículos/)).toHaveTextContent('10 de 10 veículos');
    expect(router.state.location.search).toBe('');
  });

  it('lê filtros da URL e filtra por câmbio manual', () => {
    renderAt(<Collection />, '/?cambio=manual&ordem=preco-asc');
    expect(screen.getByText(/de 10 veículos/)).toHaveTextContent('2 de 10 veículos');
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toContain('MX-5');
    expect(titles[1]).toContain('Mustang');
  });

  it('limita o comparador a três veículos e avisa', async () => {
    const user = userEvent.setup();
    renderAt(<Collection />);
    const buttons = screen.getAllByRole('button', { name: /^Comparar/ });
    for (const b of buttons.slice(0, 3)) await user.click(b);
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(3);
    await user.click(screen.getAllByRole('button', { name: /^Comparar/ })[0]);
    expect(screen.getByRole('status')).toHaveTextContent(/até 3 veículos/);
    expect(JSON.parse(localStorage.getItem(site.storageKeys.compare)!)).toHaveLength(3);
  });
});

describe('comparador', () => {
  it('mostra veículos selecionados, diferenças e permite remover', async () => {
    localStorage.setItem(site.storageKeys.compare, JSON.stringify(['mazda-mx5-2020', 'ford-mustang-1967']));
    const user = userEvent.setup();
    renderAt(<ComparePage />, '/comparar', '/comparar');
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
    expect(within(table).getByText('Menor valor')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Remover Mazda/ }));
    expect(within(screen.getByRole('table')).getAllByRole('columnheader')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(screen.getByText('Nenhum veículo selecionado.')).toBeInTheDocument();
  });
});

describe('agendamento', () => {
  it('valida, foca o primeiro erro e gera prévia copiável sem WhatsApp configurado', async () => {
    const user = userEvent.setup();
    renderAt(<Booking />, '/?visita=porsche-911-gt3-2019');

    expect(screen.getByLabelText('Veículo de interesse')).toHaveValue('porsche-911-gt3-2019');

    await user.click(screen.getByRole('button', { name: 'Preparar solicitação' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Faltam corrigir/);
    expect(screen.getByLabelText('Nome')).toHaveFocus();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText('Nome'), 'Ana Souza');
    await user.type(screen.getByLabelText('Telefone ou WhatsApp'), '11987654321');
    expect(screen.getByLabelText('Telefone ou WhatsApp')).toHaveValue('(11) 98765-4321');

    const date = new Date();
    date.setDate(date.getDate() + 3);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    await user.type(screen.getByLabelText('Data desejada'), iso);
    await user.selectOptions(screen.getByLabelText('Horário'), '14:00');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Preparar solicitação' }));

    expect(await screen.findByRole('heading', { name: 'Solicitação preparada' })).toBeInTheDocument();
    expect(screen.getByText(/Ainda não é um agendamento confirmado/)).toBeInTheDocument();
    const preview = screen.getByLabelText('Prévia da mensagem') as HTMLTextAreaElement;
    expect(preview.value).toContain('Porsche 911 GT3 (991.2), 2019');
    expect(preview.value).toContain('14:00');
    expect(screen.getByRole('button', { name: /Copiar mensagem/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument();
  });
});

describe('detalhe do veículo', () => {
  it('mostra ficha, galeria e abre consulta com mensagem personalizada', async () => {
    const user = userEvent.setup();
    renderAt(<VehiclePage />, '/veiculo/bmw-m3-competition-2023', '/veiculo/:id');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('M3');
    expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === '1 de 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Próxima foto' }));
    expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === '2 de 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Consultar veículo' }));
    const dialog = await screen.findByRole('dialog');
    expect((within(dialog).getByLabelText('Prévia da mensagem') as HTMLTextAreaElement).value).toContain('BMW M3');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('mostra estado de não encontrado para ID inválido', () => {
    renderAt(<VehiclePage />, '/veiculo/nao-existe', '/veiculo/:id');
    expect(screen.getByRole('heading', { name: 'Esta vaga está vazia.' })).toBeInTheDocument();
  });
});

describe('navbar e tema', () => {
  it('alterna tema e persiste a preferência', async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = 'dark';
    renderAt(<Navbar />);
    await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(site.storageKeys.theme)).toBe('light');
    expect(screen.getByRole('button', { name: 'Ativar tema escuro' })).toBeInTheDocument();
  });

  it('abre e fecha o menu móvel com foco controlado', async () => {
    const user = userEvent.setup();
    renderAt(<Navbar />);
    const open = screen.getByRole('button', { name: 'Abrir menu' });
    await user.click(open);
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(within(dialog).getByRole('link', { name: 'Estoque' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument());
    expect(open).toHaveFocus();
  });
});
