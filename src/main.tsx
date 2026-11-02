import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Ad = {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string | null;
};

type AdsResponse = {
  items: Ad[];
  total: number;
  page: number;
  limit: number;
};

const API_URL = 'https://inai-col1.fishrungames.com';
const categories = ['Все объявления', 'Электроника', 'Для дома', 'Одежда', 'Другое'];

function getCategory(title: string): string {
  const value = title.toLowerCase();
  if (/ноут|телефон|компьютер|планшет|наушник|камера|монитор|техник/.test(value)) return 'Электроника';
  if (/диван|стол|стул|шкаф|кровать|посуда|дом/.test(value)) return 'Для дома';
  if (/одежд|куртк|обув|плать|сумк|футбол/.test(value)) return 'Одежда';
  return 'Другое';
}

function imageSource(path: string | null): string | null {
  if (!path) return null;
  try {
    return new URL(path, API_URL).href;
  } catch {
    return null;
  }
}

function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все объявления');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  async function loadAds() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/ads`);
      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
      const data: AdsResponse = await response.json();
      setAds(Array.isArray(data.items) ? data.items : []);
    } catch {
      setError('Не удалось загрузить объявления. Проверь подключение и попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAds();
  }, []);

  const visibleAds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ads.filter((ad) => {
      const matchesCategory = category === 'Все объявления' || getCategory(ad.title) === category;
      const matchesSearch = !query || `${ad.title} ${ad.description}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [ads, search, category]);

  async function submitAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !formRef.current) return;

    const formData = new FormData(formRef.current);
    const price = Number(formData.get('price'));
    if (!Number.isFinite(price) || price < 0) {
      setMessage('Укажи корректную цену.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/ads`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Ошибка сервера: ${response.status}`);
      }
      const createdAd: Ad = await response.json();
      setAds((current) => [createdAd, ...current]);
      formRef.current.reset();
      setFormOpen(false);
      setMessage('Объявление успешно опубликовано!');
      setCategory('Все объявления');
      setSearch('');
    } catch {
      setMessage('Не получилось отправить объявление. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Tabyl — главная">
          <span className="brand-mark">T</span>
          <span>TABYL<span className="brand-dot">.</span></span>
        </a>
        <nav className="top-nav">
          <a href="#listings">Объявления</a>
          <a href="#about">О платформе</a>
        </nav>
        <button className="button button-dark top-button" onClick={() => setFormOpen(true)}>
          <span>＋</span> Разместить объявление
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> ПРОСТО. УДОБНО. РЯДОМ.</span>
            <h1>Найди то,<br />что <em>ищешь.</em></h1>
            <p>Покупай и продавай нужные вещи легко. Хорошие находки начинаются здесь.</p>
            <a className="button button-light" href="#listings">Смотреть объявления <span>↘</span></a>
          </div>
          <div className="hero-art" aria-label="Иллюстрация покупок">
            <div className="art-circle circle-one" />
            <div className="art-circle circle-two" />
            <div className="art-card card-back"><span>NEW</span><div className="art-box">✳</div></div>
            <div className="art-card card-front"><div className="art-sun">✦</div><div className="art-bag">▱</div><strong>GOOD<br />FINDS</strong><small>EVERY DAY</small></div>
            <div className="art-note note-top">твой следующий<br />любимый предмет ↗</div>
            <div className="art-note note-bottom">Покупай с умом.</div>
          </div>
          <div className="hero-index">01 — 04 <span /> MARKETPLACE</div>
        </section>

        <section className="stats-strip" id="about">
          <div><strong>01</strong><span>Найди нужное</span></div>
          <div><strong>02</strong><span>Выбери лучшее</span></div>
          <div><strong>03</strong><span>Свяжись с продавцом</span></div>
          <p>Место для хороших находок.</p>
        </section>

        <section className="listings-section" id="listings">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ВЫБИРАЙ СВОЁ</span>
              <h2>Свежие <em>объявления</em><span className="heading-star">✳</span></h2>
            </div>
            <button className="button button-outline" onClick={() => void loadAds()} disabled={loading}>
              ↻ Обновить
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Что будем искать?" aria-label="Поиск объявлений" />
              {search && <button onClick={() => setSearch('')} aria-label="Очистить поиск">×</button>}
            </div>
            <div className="category-list" aria-label="Категории">
              {categories.map((item) => (
                <button key={item} className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)}>{item}</button>
              ))}
            </div>
          </div>

          {message && <p className="notice" role="status">{message}</p>}
          {error && <div className="error-state"><p>{error}</p><button className="button button-outline" onClick={() => void loadAds()}>Попробовать снова</button></div>}

          {loading ? (
            <div className="empty-state"><span className="loader" />Загружаем объявления...</div>
          ) : !error && visibleAds.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">⌕</span><strong>Пока ничего не найдено</strong><span>Попробуй изменить запрос или выбери другую категорию.</span></div>
          ) : (
            <div className="ads-grid">
              {visibleAds.map((ad) => {
                const src = imageSource(ad.image_url);
                return (
                  <article className="ad-card" key={ad.id}>
                    <div className="ad-image">
                      {src ? <img src={src} alt={ad.title} loading="lazy" /> : <div className="image-placeholder"><span>✳</span><small>TABYL FIND</small></div>}
                      <span className="ad-category">{getCategory(ad.title)}</span>
                    </div>
                    <div className="ad-info">
                      <div className="ad-title-row"><h3>{ad.title}</h3><span className="ad-arrow">↗</span></div>
                      <p>{ad.description}</p>
                      <div className="ad-footer"><strong>{Number(ad.price).toLocaleString('ru-RU')} сом</strong><span>№ {ad.id}</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="listings-bottom"><span>ПОКАЗАНО {visibleAds.length} ИЗ {ads.length}</span><span>ТАБЫЛ — НАХОДИ СВОЁ ✳</span></div>
        </section>

        <section className="cta">
          <div><span className="eyebrow">ЕСТЬ ЧТО ПРОДАТЬ?</span><h2>Твоя вещь —<br /><em>чья-то находка.</em></h2></div>
          <button className="button button-light" onClick={() => setFormOpen(true)}>Разместить объявление <span>↗</span></button>
          <span className="cta-spark">✳</span>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark">T</span><span>TABYL<span className="brand-dot">.</span></span></a>
        <span>© 2026 TABYL MARKET</span><a href="#top">НАВЕРХ ↑</a>
      </footer>

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <button className="modal-close" onClick={() => setFormOpen(false)} aria-label="Закрыть">×</button>
            <span className="eyebrow">ПОДЕЛИСЬ СООБЩЕСТВОМ</span>
            <h2 id="form-title">Новое <em>объявление</em></h2>
            <p className="modal-intro">Заполни информацию о вещи — и она появится в списке.</p>
            <form ref={formRef} className="ad-form" onSubmit={submitAd}>
              <label>Название вещи<input name="title" placeholder="Например, ноутбук Lenovo" required maxLength={100} /></label>
              <label>Описание<textarea name="description" placeholder="Расскажи о состоянии и особенностях..." required rows={3} maxLength={1000} /></label>
              <label>Цена, сом<input name="price" type="number" min="0" step="0.01" placeholder="15000" required /></label>
              <label>Фотография<input name="image" type="file" accept="image/*" required /></label>
              <button className="button button-dark submit-button" type="submit" disabled={busy}>{busy ? 'Публикуем...' : 'Опубликовать объявление ↗'}</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
