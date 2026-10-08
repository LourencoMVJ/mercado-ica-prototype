# Mercado ICA — Protótipo de interface

Protótipo só de UI (HTML/CSS/JS), sem controllers nem base de dados. Usa o **CSS, as fontes de ícones e as imagens compiladas do projeto real** (copiados de `public/themes` e `public/Assets`) e reproduz a estrutura das views Blade reais (loja, painel do vendedor e administração).

- `comprador/` — loja pública (Ana Machava)
- `cliente/`   — painel do vendedor (TechMoz Solutions)
- `admin/`     — administração (Admin ICA)

Atalho para testes: acrescentar `?demo` ao URL de cada perfil inicia a sessão de demonstração.
Dados fictícios em `assets/js/data.js`; sessão, carrinho e pedidos novos só existem em sessionStorage.
