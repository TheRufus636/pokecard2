import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
 



function App() {

    const [screen, setScreen] = useState('login');


    const [user, setUser] = useState(null);


    const handleRegister = (e) => {

        e.preventDefault();


        setUser({ name: 'Entrenador', balance: 500 });


        setScreen('tienda');
    };


    const handleLogin = (e) => {
        e.preventDefault();

        setUser({ name: 'Entrenador', balance: 500 });
        setScreen('tienda');
    };


    if (screen === 'login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-800">¡Bienvenido!</h2>

                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="tu@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl">
                            Iniciar Sesión
                        </button>
                    </form>

                    <div className="mt-6 text-center">

                        <button onClick={() => setScreen('register')} className="text-red-600 font-semibold hover:underline">
                            ¿No tienes cuenta? Regístrate aquí
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    if (screen === 'register') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Nuevo Entrenador</h2>
                    <p className="text-center text-gray-500 mb-8"></p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Usuario</label>
                            <input type="text" placeholder="Nombre de usuario" className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" placeholder="Email" className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl" required />
                        </div>
                        <div>

                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input type="password" placeholder="Contraseña" className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl" minLength="6" required />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">
                            Crear Cuenta
                        </button>
                    </form>

                    <button onClick={() => setScreen('login')} className="w-full mt-4 text-gray-500 text-sm hover:underline">
                        Ya tengo cuenta
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-zinc-700">
            <nav className="bg-zinc-900 border-b px-6 py-4 flex items-center justify-between">


                <div className="flex items-center gap-3 cursor-pointer w-1/4">
                    <img src="/img/pokeball.gif" alt="Pokeball" className="h-8 w-8" />
                    <p className="text-2xl font-black text-purple-700 uppercase tracking-wider">PokeCollect</p>
                </div>


                <div className="flex items-center justify-center gap-8 w-2/4">
                    <button
                        onClick={() => setScreen('tienda')}
                       className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors cursor-pointer">
                        <img src="/img/tienda.png" alt="Tienda icono" className="w-7 h-7 invert" />
                        <span>Tienda</span>
                    </button>

                    <button
                        onClick={() => setScreen('coleccion')}
                       className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors cursor-pointer">
                        <img src="/img/coleccion.png" alt="Coleccion icono" className="w-7 h-7 invert" />
                        <span>Colección</span>
                    </button>

                    <button 
                        onClick={() => setScreen('mazo')}
                       className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors cursor-pointer">
                        <img src="/img/espadas.png" alt="Mazo icono" className="w-7 h-7 invert" />
                        <span>Mazo</span>
                    </button>

                    <button 
                        onClick={() => setScreen('social')}
                       className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors cursor-pointer">
                        <img src="/img/comunidad.png" alt="Social icono" className="w-7 h-7 invert" />
                        <span>Social</span>
                    </button>
                </div>


                <div className="flex items-center justify-end gap-6 w-1/4">
                    <div className="bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full font-bold flex items-center gap-2">
                        <p>🪙</p>
                        <p>{user.balance}</p>
                    </div>
                    <button onClick={() => setScreen('login')} className="text-gray-400 hover:text-red-600 font-bold uppercase text-sm cursor-pointer">
                        Cerrar Sesion
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8 text-center">
                <h2 className="text-4xl font-black text-gray-800 mb-2 uppercase">Tienda de Sobres</h2>
                <p className="text-gray-500 mb-12">Elige un sobre y completa tu colección Pokemon</p>

                <div className="grid grid-cols-3 gap-8">


                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-zinc-950 flex flex-col items-center transition-transform hover:-translate-y-2">
                        <div className="w-full bg-red-500 rounded-xl py-8 mb-6 flex justify-center">
                            <img src="/img/pokeballred.gif" className="h-20 w-20" alt="Básico" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 uppercase">Sobre Básico</h3>
                        <p className="text-gray-400 text-sm mb-4">Ideal para empezar la coleccion</p>
                        <div className="w-full flex justify-between px-4 mb-6 font-bold text-sm">
                            <span className="text-gray-600">5 CARTAS</span>
                            <span className="text-red-600">🪙 50</span>
                        </div>
                        <button
                            onClick={() => comprarSobre('Básico', 50, 5)}
                            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            COMPRAR
                        </button>
                    </div>


                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-zinc-950 flex flex-col items-center transition-transform hover:-translate-y-2 relative">

                        <div className="w-full bg-blue-500 rounded-xl py-8 mb-6 flex justify-center">
                            <img src="/img/superball.gif" className="h-20 w-20" alt="Estándar" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 uppercase">Sobre Estándar</h3>
                        <p className="text-gray-400 text-sm mb-4">Más cartas, más posibilidades</p>
                        <div className="w-full flex justify-between px-4 mb-6 font-bold text-sm">
                            <span className="text-gray-600"> 12 CARTAS</span>
                            <span className="text-blue-600">🪙 100</span>
                        </div>
                        <button
                            onClick={() => comprarSobre('Estándar', 100, 12)}
                            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            COMPRAR
                        </button>
                    </div>


                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-zinc-950 flex flex-col items-center transition-transform hover:-translate-y-2">
                        <div className="w-full bg-purple-600 rounded-xl py-8 mb-6 flex justify-center">
                            <img src="/img/lunaball.gif" className="h-20 w-20" alt="Premium" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 uppercase">Sobre Premium</h3>
                        <p className="text-gray-400 text-sm mb-4">La mejor forma de completar tu Pokédex</p>
                        <div className="w-full flex justify-between px-4 mb-6 font-bold text-sm">
                            <span className="text-gray-600">25 CARTAS</span>
                            <span className="text-purple-600">🪙 200</span>
                        </div>
                        <button
                            onClick={() => comprarSobre('Premium', 200, 25)}
                            className="w-full bg-zinc-900 text-white font-bold py-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            COMPRAR
                        </button>
                    </div>

                </div>

                
                
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);