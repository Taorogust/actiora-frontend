// src/layouts/demo4/components/footer.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/container';
import { generalSettings } from '@/config/general.config';
import { GitHub, Twitter, Linkedin, Mail, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Footer: React.FC = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  // Newsletter state
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 1000));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  // Back to Top button visibility
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy-load social icons when in view
  const { ref: socialRef, inView: socialInView } = useInView({ triggerOnce: true });

  return (
    <motion.footer
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Resources Links */}
          <div>
            <h5 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Recursos</h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {[
                { label: 'Documentación', href: generalSettings.docsLink },
                { label: 'Desarrolladores', href: generalSettings.devsLink },
                { label: 'FAQ', href: generalSettings.faqLink },
                { label: 'Términos', href: generalSettings.licenseLink },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-dp-blue"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Compañía</h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {[
                { label: 'Acerca', href: generalSettings.aboutLink, internal: false },
                { label: 'Contacto', href: '/contact', internal: true },
                { label: 'Soporte', href: '/support', internal: true },
                { label: 'Privacidad', href: '/privacy', internal: true },
              ].map(link => (
                <li key={link.label}>
                  {link.internal ? (
                    <Link to={link.href} className="transition-colors hover:text-dp-blue">
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-dp-blue"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-2">
            <h5 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Newsletter</h5>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Suscríbete para recibir noticias y actualizaciones.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <Input
                ref={inputRef}
                type="email"
                placeholder="Tu correo"
                aria-label="Correo newsletter"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="solid"
                disabled={status === 'loading'}
                className="whitespace-nowrap"
              >
                {status === 'loading' ? 'Enviando...' : status === 'success' ? '¡Gracias!' : 'Suscribir'}
              </Button>
            </form>
            <AnimatePresence>
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-red-500"
                >
                  Error al suscribir. Intenta de nuevo.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Social icons */}
          <div ref={socialRef}>
            <h5 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Síguenos</h5>
            <div className="flex items-center space-x-4">
              {socialInView && [
                { Icon: GitHub, href: 'https://github.com/dataport', label: 'GitHub' },
                { Icon: Twitter, href: 'https://twitter.com/dataport', label: 'Twitter' },
                { Icon: Linkedin, href: 'https://linkedin.com/company/dataport', label: 'LinkedIn' },
                { Icon: Mail, href: 'mailto:contact@dataport.io', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider & copyright */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>© {year} DataPort Wallet™ v2.0. Todos los derechos reservados.</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver arriba"
            onClick={scrollToTop}
            className={
              `transform transition-transform ${showTop ? 'scale-100' : 'scale-0'} ` +
              `fixed bottom-4 right-4 bg-dp-blue text-white shadow-lg rounded-full`
            }
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </Container>
    </motion.footer>
  );
};

export default memo(Footer);
