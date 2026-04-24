import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import { api } from './api.js';
import Tienda from './tienda.jsx';
import Coleccion from './coleccion.jsx';
import Mazo from './mazo.jsx';
import Social from './social.jsx';

/* ─── Pantalla de Login ──────────────────────────────────────────────────── */
function Login({ onLogin, onGoRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.login({ email, password });
            onLogin(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-zinc-900 p-4">
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/img/pokeball.gif" alt="Pokeball" className="h-16 w-16 mx-auto mb-3" />
                    <h2 className="text-3xl font-black text-white tracking-wide">PokeCollect</h2>
                    <p className="text-zinc-400 text-sm mt-1">Inicia sesión para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                        <input
                            type="email" required value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Contraseña</label>
                        <input
                            type="password" required value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={onGoRegister} className="text-red-400 hover:text-red-300 font-medium text-sm">
                        ¿No tienes cuenta? Regístrate aquí
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Pantalla de Registro ───────────────────────────────────────────────── */
function Register({ onLogin, onGoLogin }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function update(field) {
        return e => setForm(f => ({ ...f, [field]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (form.password !== form.password_confirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        try {
            const data = await api.register(form);
            onLogin(data.user);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstKey = Object.keys(errors)[0];
                setError(errors[firstKey][0]);
            } else {
                setError(err.response?.data?.message || 'Error al registrarse');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-zinc-900 p-4">
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/img/pokeball.gif" alt="Pokeball" className="h-16 w-16 mx-auto mb-3" />
                    <h2 className="text-3xl font-black text-white tracking-wide">Nuevo Entrenador</h2>
                    <p className="text-zinc-400 text-sm mt-1">Crea tu cuenta y empieza a coleccionar</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Nombre de usuario', field: 'name', type: 'text', ph: 'Ash Ketchum' },
                        { label: 'Email', field: 'email', type: 'email', ph: 'ash@pallet.com' },
                        { label: 'Contraseña', field: 'password', type: 'password', ph: '••••••••' },
                        { label: 'Confirmar contraseña', field: 'password_confirmation', type: 'password', ph: '••••••••' },
                    ].map(({ label, field, type, ph }) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">{label}</label>
                            <input
                                type={type} required value={form[field]}
                                onChange={update(field)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                placeholder={ph}
                            />
                        </div>
                    ))}
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button onClick={onGoLogin} className="text-zinc-400 hover:text-zinc-200 text-sm">
                        Ya tengo cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Layout principal con navbar ────────────────────────────────────────── */
function Layout({ user, setUser, screen, setScreen, children }) {
    async function handleLogout() {
        try { await api.logout(); } catch { }
        setUser(null);
        setScreen('login');
    }

    const navItems = [
        { id: 'tienda', label: 'Tienda', icon: '/img/tienda.png' },
        { id: 'coleccion', label: 'Colección', icon: '/img/coleccion.png' },
        { id: 'mazo', label: 'Mazo', icon: '/img/espadas.png' },
        { id: 'social', label: 'Social', icon: '/img/comunidad.png' },
    ];

    return (
        <div className="min-h-screen bg-zinc-800">
            <nav className="bg-zinc-900 border-b border-zinc-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3 w-1/3">
                    <img src="/img/pokeball.gif" alt="logo" className="h-8 w-8" />
                    <span className="text-xl font-black text-purple-400 tracking-widest uppercase">PokeCollect</span>
                </div>

                <div className="flex items-center justify-center gap-4 w-1/3">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setScreen(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${screen === item.id
                                    ? 'bg-purple-600 text-white'
                                    : 'text-zinc-300 hover:text-white hover:bg-zinc-700'
                                }`}
                        >
                            <img src={item.icon} alt={item.label} className="w-7 h-7 invert" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-6 w-1/3">
                    <div className="flex items-center bg-yellow-900/40 border border-yellow-600/50 rounded-full pl-4 pr-1 py-1">
                        <span className="text-yellow-400 font-bold text-sm mr-3 flex items-center gap-1.5">
                            🪙 <span>{user.coins}</span>
                        </span>
                        <button
                            className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 w-7 h-7 rounded-full flex items-center justify-center font-black text-lg transition-transform hover:scale-105"
                            title="Recargar monedas"
                        >
                            +
                        </button>
                    </div>
                    <span className="text-zinc-400 text-sm hidden md:block">{user.name}</span>
                    <button
                        onClick={handleLogout}
                        className="text-zinc-400 hover:text-red-400 text-xs font-bold uppercase tracking-wide transition-colors"
                    >
                        Salir
                    </button>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}

/* ─── App raíz ───────────────────────────────────────────────────────────── */
function App() {
    const [screen, setScreen] = useState('login');
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    // Comprobar sesión activa al arrancar
    useEffect(() => {
        api.me()
            .then(data => {
                setUser(data.user);
                setScreen('tienda');
            })
            .catch(() => { })
            .finally(() => setChecking(false));
    }, []);

    // Actualizar monedas cuando cambien (desde Tienda, Mazo, etc.)
    const updateCoins = useCallback((coins) => {
        setUser(u => ({ ...u, coins }));
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <img src="/img/pokeball.gif" alt="cargando" className="h-16 w-16 animate-spin" />
            </div>
        );
    }

    if (!user) {
        if (screen === 'register') {
            return (
                <Register
                    onLogin={u => { setUser(u); setScreen('tienda'); }}
                    onGoLogin={() => setScreen('login')}
                />
            );
        }
        return (
            <Login
                onLogin={u => { setUser(u); setScreen('tienda'); }}
                onGoRegister={() => setScreen('register')}
            />
        );
    }

    const screens = {
        tienda: <Tienda user={user} updateCoins={updateCoins} />,
        coleccion: <Coleccion user={user} />,
        mazo: <Mazo user={user} />,
        social: <Social user={user} />,
    };

    return (
        <Layout user={user} setUser={setUser} screen={screen} setScreen={setScreen}>
            {screens[screen] || screens.tienda}
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
