import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaAnchor, FaTools, FaShip, FaShoppingCart, FaUserTie } from 'react-icons/fa';
import Hero3D from '../components/3d/Hero3D';

const LandingPage = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <FaShip className="w-8 h-8 text-teal-400" />,
            title: "Premium Boat Rides",
            description: "Experience luxury on the water with our exclusive fleet of premium boats available for booking."
        },
        {
            icon: <FaTools className="w-8 h-8 text-teal-400" />,
            title: "Expert Maintenance",
            description: "Top-tier maintenance services provided by certified marine engineers to keep your vessel in prime condition."
        },
        {
            icon: <FaShoppingCart className="w-8 h-8 text-teal-400" />,
            title: "Marine Store",
            description: "Access a wide range of high-quality spare parts and accessories for all your nautical needs."
        },
        {
            icon: <FaUserTie className="w-8 h-8 text-teal-400" />,
            title: "Concierge Service",
            description: "Personalized support and consultation for boat purchases and custom requirements."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden">

            {/* Hero Section with Background Image */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url(/boat-hero.png)',
                        backgroundPosition: 'center center',
                    }}
                >
                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90"></div>

                    {/* Vignette Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/60"></div>
                </div>

                {/* 3D Background (Optional - can be removed if you want only the image) */}
                <div className="absolute inset-0 opacity-20">
                    <Hero3D />
                </div>

                {/* Overlay Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-white to-teal-200 drop-shadow-2xl">
                            Marine Excellence Reimagined
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-2xl text-white mb-10 max-w-3xl mx-auto font-light drop-shadow-lg"
                    >
                        Your premier destination for luxury boat rides, professional maintenance, and comprehensive marine solutions.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_20px_rgba(13,148,136,0.5)] hover:shadow-[0_0_30px_rgba(13,148,136,0.7)] backdrop-blur-sm hover:scale-105"
                            >
                                Go to Dashboard
                            </Link>

                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_20px_rgba(13,148,136,0.5)] hover:shadow-[0_0_30px_rgba(13,148,136,0.7)] backdrop-blur-sm hover:scale-105"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/services"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 rounded-full font-semibold text-lg transition-all backdrop-blur-md hover:scale-105 hover:border-white/50"
                                >
                                    Explore Services
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 drop-shadow-lg"
                >
                    <FaAnchor className="w-6 h-6" />
                </motion.div>
            </section>

            {/* Features/Stats Section - Glassmorphism */}
            <section className="relative py-20 px-4 -mt-20 z-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-slate-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-slate-700/50 transition-all group hover:scale-105 hover:border-teal-500/30"
                        >
                            <div className="mb-4 p-3 bg-teal-900/30 rounded-xl inline-block group-hover:bg-teal-900/50 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-teal-300 transition-colors">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mock CTA Section/Footer Preview */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to Set Sail?</h2>
                    <p className="text-slate-400 mb-10 text-lg">Join thousands of satisfied customers who trust us with their marine adventures.</p>

                    {!user && <Link to="/register" className="inline-block px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
                        Create Free Account
                    </Link>}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
