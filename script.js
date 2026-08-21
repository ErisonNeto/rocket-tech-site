const menuButton = document.querySelector('[data-mobile-menu-toggle]');
const navMenu = document.querySelector('#rocket-mobile-menu');
const navLinks = document.querySelectorAll('[data-nav-link][href^="#"]');
const revealItems = document.querySelectorAll('.reveal');
const currentYear = document.querySelector('#current-year');
const cursorGlow = document.querySelector('.cursor-glow');
const tiltCards = document.querySelectorAll('.tilt-card');
const magneticItems = document.querySelectorAll('.magnetic');
const parallaxZone = document.querySelector('.parallax-zone');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktopQuery = window.matchMedia('(min-width: 861px)');

if (currentYear) currentYear.textContent = new Date().getFullYear();

// Menu mobile: implementação única e consistente.
function setMenuOpen(open) {
  if (!menuButton || !navMenu) return;
  navMenu.classList.toggle('is-open', open);
  menuButton.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

function closeMenu() {
  setMenuOpen(false);
}

menuButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setMenuOpen(!navMenu?.classList.contains('is-open'));
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!navMenu?.classList.contains('is-open')) return;
  if (navMenu.contains(event.target) || menuButton?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

function handleDesktopChange(event) {
  if (event.matches) closeMenu();
}

if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleDesktopChange);
else desktopQuery.addListener?.(handleDesktopChange);

// Reveal progressivo com fallback para navegadores sem IntersectionObserver.
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 28, 180)}ms`;
    revealObserver.observe(item);
  });
}

// Estado ativo da navegação baseado nos IDs reais das seções.
const sections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const activeObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const activeId = visible.target.id;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-38% 0px -52% 0px', threshold: [0.01, 0.2, 0.45] });

  sections.forEach((section) => activeObserver.observe(section));
}

// Microinterações apenas em ponteiros precisos e sem preferência por redução de movimento.
const finePointer = window.matchMedia('(pointer: fine)').matches;

if (!reduceMotion && finePointer && cursorGlow) {
  window.addEventListener('pointermove', (event) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;

    const x = (event.clientX / window.innerWidth - 0.5) * 20;
    const y = (event.clientY / window.innerHeight - 0.5) * 20;
    if (parallaxZone) {
      parallaxZone.style.transform = `rotateX(${-y * 0.13}deg) rotateY(${x * 0.13}deg) translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    cursorGlow.style.opacity = '0';
    if (parallaxZone) parallaxZone.style.transform = '';
  });
}

tiltCards.forEach((card) => {
  if (reduceMotion || !finePointer) return;

  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
    card.style.removeProperty('--mouse-x');
    card.style.removeProperty('--mouse-y');
  });
});

magneticItems.forEach((item) => {
  if (reduceMotion || !finePointer) return;

  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  item.addEventListener('pointerleave', () => {
    item.style.transform = '';
  });
});

// Partículas discretas: detalhe visual, sem competir com o conteúdo.
function createSparkles() {
  if (reduceMotion) return;
  const background = document.querySelector('.space-background');
  if (!background) return;
  const fragment = document.createDocumentFragment();
  const total = window.innerWidth < 720 ? 10 : 18;

  for (let i = 0; i < total; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'runtime-sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * -7}s`;
    sparkle.style.animationDuration = `${5 + Math.random() * 5}s`;
    fragment.appendChild(sparkle);
  }

  background.appendChild(fragment);
}

createSparkles();

// Evita que o botão flutuante cubra os CTAs principais no topo em telas pequenas.
const whatsappFloat = document.querySelector('.whatsapp-float');
const heroActions = document.querySelector('.hero-actions');
const compactFloatQuery = window.matchMedia('(max-width: 680px)');
let heroActionsVisible = false;

function updateFloatingWhatsApp() {
  whatsappFloat?.classList.toggle('is-suppressed', compactFloatQuery.matches && heroActionsVisible);
}

if (whatsappFloat && heroActions && 'IntersectionObserver' in window) {
  const heroActionsObserver = new IntersectionObserver(([entry]) => {
    heroActionsVisible = entry.isIntersecting;
    updateFloatingWhatsApp();
  }, { threshold: 0.18 });
  heroActionsObserver.observe(heroActions);
  if (compactFloatQuery.addEventListener) compactFloatQuery.addEventListener('change', updateFloatingWhatsApp);
  else compactFloatQuery.addListener?.(updateFloatingWhatsApp);
}

// Abertura RocketTech. Mantém o visual original e encerra em 2 segundos.
const siteIntro = document.querySelector('#site-intro');
const introTypewriter = document.querySelector('#intro-typewriter');
let introTimer;
let typingTimer;
let introKeyHandler = null;

function renderTypedCode(text) {
  if (!introTypewriter) return;
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  introTypewriter.innerHTML = safeText.replace(/(Rocket Tech)/g, '<span class="code-name">$1</span>');
}

function startIntroTyping() {
  if (!introTypewriter || reduceMotion) {
    renderTypedCode('Rocket Tech');
    return;
  }

  const finalText = 'Rocket Tech';
  let index = 0;
  const typeNext = () => {
    renderTypedCode(finalText.slice(0, index));
    index += 1;
    if (index <= finalText.length) typingTimer = window.setTimeout(typeNext, 42);
  };
  typingTimer = window.setTimeout(typeNext, 220);
}

function closeIntro() {
  if (!siteIntro || siteIntro.classList.contains('is-hidden')) return;
  window.clearTimeout(introTimer);
  window.clearTimeout(typingTimer);
  if (introKeyHandler) {
    window.removeEventListener('keydown', introKeyHandler);
    introKeyHandler = null;
  }
  siteIntro.classList.add('is-hidden');
  document.body.classList.remove('intro-lock');
  window.setTimeout(() => siteIntro.remove(), reduceMotion ? 0 : 430);
}

function createIntroStarfield() {
  const field = document.querySelector('.intro-starfield');
  if (!field || reduceMotion) return;
  const totalStars = window.innerWidth < 720 ? 44 : 78;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < totalStars; i += 1) {
    const star = document.createElement('span');
    const size = Math.random() < 0.74 ? 1 + Math.random() * 1.5 : 2.4 + Math.random() * 2.6;
    star.className = `intro-star${Math.random() > 0.72 ? ' green' : ''}`;
    star.style.setProperty('--x', `${Math.random() * 100}%`);
    star.style.setProperty('--y', `${Math.random() * 100}%`);
    star.style.setProperty('--s', `${size}px`);
    star.style.setProperty('--o', `${0.25 + Math.random() * 0.72}`);
    star.style.setProperty('--dur', `${3.4 + Math.random() * 7.8}s`);
    star.style.setProperty('--delay', `${Math.random() * -8}s`);
    star.style.setProperty('--dx', `${-8 + Math.random() * 16}px`);
    star.style.setProperty('--dy', `${-8 + Math.random() * 16}px`);
    star.style.setProperty('--glow-size', `${8 + Math.random() * 18}px`);
    fragment.appendChild(star);
  }
  field.appendChild(fragment);
}

if (siteIntro) {
  if (reduceMotion) {
    siteIntro.remove();
  } else {
    document.body.classList.add('intro-lock');
    createIntroStarfield();
    startIntroTyping();
    introTimer = window.setTimeout(closeIntro, 2000);
    introKeyHandler = (event) => {
      if (!['Escape', 'Enter', ' '].includes(event.key)) return;
      closeIntro();
    };
    window.addEventListener('keydown', introKeyHandler);
    siteIntro.addEventListener('click', closeIntro, { once: true });
  }
}

// Se uma imagem local falhar, o card mantém um fallback visual sem hotlink externo.
document.querySelectorAll('img').forEach((img) => {
  img.addEventListener('error', () => {
    img.closest('.project-image')?.classList.add('is-image-missing');
    img.hidden = true;
  }, { once: true });
});


// Diagnóstico de orçamento RocketTech: 6 etapas, sem backend e com envio final pelo WhatsApp.
const budgetModal = document.querySelector('#budget-modal');
const budgetForm = document.querySelector('#budget-form');
const budgetContent = document.querySelector('#budget-step-content');
const budgetBack = document.querySelector('#budget-back');
const budgetNext = document.querySelector('#budget-next');
const budgetOpeners = document.querySelectorAll('[data-open-budget]');
const budgetClosers = document.querySelectorAll('[data-budget-close]');
const budgetProgressElement = document.querySelector('.budget-progress');
const budgetProgress = [...document.querySelectorAll('.budget-progress span')];
const budgetAsideNumber = document.querySelector('#budget-aside-number');
const budgetAsideKicker = document.querySelector('#budget-aside-kicker');
const budgetAsideTitle = document.querySelector('#budget-aside-title');
const budgetAsideText = document.querySelector('#budget-aside-text');
const budgetMobileCurrent = document.querySelector('#budget-mobile-current');
const BUDGET_PHONE = '5591984645589';
const budgetBackground = document.querySelectorAll('.site-header, #conteudo-principal, .whatsapp-float, .site-footer');

const budgetState = {
  service: '',
  serviceLabel: '',
  current: '',
  currentLabel: '',
  currentTool: '',
  goal: '',
  goalLabel: '',
  stage: '',
  stageLabel: '',
  details: '',
  deadline: '',
  deadlineLabel: '',
  investment: '',
  investmentLabel: '',
  name: '',
  company: '',
  whatsapp: '',
  email: ''
};

let budgetStep = 1;
let budgetComplete = false;
let budgetLastFocused = null;

const serviceOptions = [
  ['ecommerce', 'E-commerce', 'Loja virtual, catálogo ou marketplace', 'EC'],
  ['system', 'Sistema sob medida', 'Gestão, operação, dados e ferramentas internas', 'SI'],
  ['site', 'Site institucional', 'Apresentação, autoridade, portfólio ou blog', 'ST'],
  ['landing', 'Landing page', 'Campanha, serviço específico ou geração de leads', 'LP'],
  ['automation', 'Automação e integrações', 'Processos, WhatsApp, APIs e ferramentas conectadas', 'AU'],
  ['traffic', 'Tráfego pago', 'Campanhas para alcançar o público certo e gerar oportunidades', 'TP'],
  ['social', 'Gestão de redes sociais', 'Conteúdo, planejamento e presença digital da marca', 'RS'],
  ['other', 'Outro', 'Uma necessidade diferente das opções acima', 'OT']
];

const goalOptions = [
  ['leads', 'Gerar mais contatos', 'Transformar visitas e interesse em oportunidades comerciais', '01'],
  ['sales', 'Vender online', 'Apresentar produtos e facilitar a jornada de compra', '02'],
  ['operation', 'Organizar a operação', 'Centralizar dados, processos, cadastros e rotinas', '03'],
  ['automate', 'Automatizar tarefas', 'Reduzir trabalho manual e etapas repetitivas', '04'],
  ['integrate', 'Conectar ferramentas', 'Fazer sistemas e plataformas trocarem informações', '05'],
  ['experience', 'Melhorar a experiência digital', 'Modernizar uma solução existente e deixá-la mais clara', '06'],
  ['visibility', 'Aumentar alcance e visibilidade', 'Fortalecer a presença da marca e alcançar mais pessoas', '07']
];

const stageOptions = [
  ['idea', 'Tenho apenas a ideia', 'Ainda preciso estruturar escopo e prioridades', '01'],
  ['references', 'Já tenho referências', 'Sei mais ou menos o visual e a direção que quero', '02'],
  ['content', 'Já tenho conteúdo ou estrutura', 'Parte do material e das regras do projeto já está pronta', '03'],
  ['evolve', 'Já existe e quero evoluir', 'Quero melhorar ou substituir uma solução atual', '04']
];

const deadlineOptions = [
  ['now', 'O quanto antes', 'Quero iniciar assim que alinharmos o projeto', '01'],
  ['month', 'Nas próximas 2 a 4 semanas', 'Tenho uma janela próxima para começar', '02'],
  ['quarter', 'Entre 1 e 3 meses', 'Estou planejando com alguma antecedência', '03'],
  ['research', 'Ainda estou pesquisando', 'Quero entender a melhor solução antes de definir prazo', '04']
];

const investmentOptions = [
  ['until1500', 'Até R$ 1.500', 'Projetos menores ou uma primeira etapa'],
  ['1500to3000', 'R$ 1.500 a R$ 3.000', 'Escopo intermediário'],
  ['3000to6000', 'R$ 3.000 a R$ 6.000', 'Projeto mais completo ou personalizado'],
  ['6000plus', 'Acima de R$ 6.000', 'Soluções maiores, sistemas ou múltiplas integrações'],
  ['unknown', 'Ainda não defini', 'Quero entender o escopo antes de falar em investimento']
];

const asideCopy = {
  1: ['DIAGNÓSTICO GRATUITO', 'Descubra o que seu projeto realmente precisa.', 'Seis etapas rápidas para organizar sua necessidade antes de falar com a RocketTech.'],
  2: ['PONTO DE PARTIDA', 'Perfeito. Vamos entender o cenário atual.', 'Saber o que já existe evita retrabalho e ajuda a definir um caminho mais inteligente.'],
  3: ['OBJETIVO', 'Agora vamos falar do resultado que você procura.', 'A tecnologia é o meio. Esta etapa ajuda a identificar o que o projeto precisa gerar para o negócio.'],
  4: ['ESCOPO', 'Em que estágio essa ideia está hoje?', 'Referências, materiais e soluções existentes ajudam a estimar melhor a complexidade do projeto.'],
  5: ['PLANEJAMENTO', 'Prazo e investimento ajudam a definir a rota.', 'Não é um orçamento automático. Essas respostas apenas ajudam a RocketTech a indicar uma solução compatível.'],
  6: ['CONTATO', 'Última etapa. Como podemos falar com você?', 'Seus dados serão usados apenas para montar a mensagem que você poderá enviar para a RocketTech pelo WhatsApp.']
};

function budgetOption(value, title, description, icon, selected) {
  return `<button class="budget-option${selected ? ' is-selected' : ''}" type="button" data-budget-option="${value}" aria-pressed="${selected ? 'true' : 'false'}">
    <span class="budget-option-icon" aria-hidden="true">${icon}</span>
    <span class="budget-option-copy"><strong>${title}</strong><small>${description}</small></span>
    <span class="budget-radio" aria-hidden="true"></span>
  </button>`;
}

function renderOptionList(options, selected) {
  return `<div class="budget-options">${options.map((item) => budgetOption(item[0], item[1], item[2], item[3], selected === item[0])).join('')}</div>`;
}

function getStepTwoConfig() {
  const configs = {
    ecommerce: {
      title: 'Sobre sua loja', subtitle: 'Isso ajuda a entender o ponto de partida.', fieldLabel: 'Qual plataforma ou endereço usa hoje? (opcional)', placeholder: 'Shopify, Nuvemshop, loja própria, URL...',
      options: [['online', 'Já vendo online', 'Tenho uma loja, catálogo ou canal de vendas digital', '01'], ['offline', 'Ainda não vendo online', 'O projeto será meu primeiro canal de venda digital', '02']]
    },
    site: {
      title: 'Sobre sua presença digital', subtitle: 'Queremos saber se existe algo que precisa ser aproveitado ou substituído.', fieldLabel: 'Qual é o endereço do site atual? (opcional)', placeholder: 'https://seusite.com.br',
      options: [['existing', 'Já tenho um site', 'Quero reformular, modernizar ou evoluir o que existe', '01'], ['new', 'Ainda não tenho um site', 'Será a primeira presença digital estruturada da empresa', '02']]
    },
    landing: {
      title: 'Sobre sua campanha', subtitle: 'Uma landing page funciona melhor quando existe uma oferta bem definida.', fieldLabel: 'Qual produto ou serviço será divulgado? (opcional)', placeholder: 'Ex.: consultoria, curso, serviço local...',
      options: [['defined', 'Já tenho a oferta definida', 'Sei o que quero divulgar e para qual público', '01'], ['structuring', 'Ainda preciso estruturar', 'Tenho a ideia, mas preciso organizar a comunicação', '02']]
    },
    system: {
      title: 'Como você controla isso hoje?', subtitle: 'Entender a operação atual ajuda a identificar o que realmente precisa ser automatizado.', fieldLabel: 'Qual ferramenta ou sistema usa hoje? (opcional)', placeholder: 'Excel, Google Sheets, ERP, sistema interno...',
      options: [['manual', 'Planilhas ou processo manual', 'A operação depende de controles separados ou tarefas manuais', '01'], ['replace', 'Já uso um sistema', 'Quero substituir ou melhorar uma ferramenta existente', '02'], ['new', 'É uma operação nova', 'O sistema será criado junto com um novo processo', '03']]
    },
    automation: {
      title: 'Como o processo funciona hoje?', subtitle: 'Queremos entender o quanto da rotina já está automatizada.', fieldLabel: 'Quais ferramentas participam desse processo? (opcional)', placeholder: 'WhatsApp, planilha, CRM, e-mail, API...',
      options: [['manual', 'É totalmente manual', 'A equipe executa todas as etapas uma por uma', '01'], ['partial', 'Já existe alguma automação', 'Parte do processo já acontece automaticamente', '02'], ['evolve', 'Já tenho automações e quero evoluir', 'Preciso integrar, ampliar ou tornar o fluxo mais confiável', '03']]
    },
    traffic: {
      title: 'Como está sua aquisição de clientes hoje?', subtitle: 'Queremos entender se já existe mídia ativa ou se a estratégia será criada do zero.', fieldLabel: 'Conte um pouco do cenário atual (opcional)', placeholder: 'Ex.: já anuncio no Instagram, tenho site e recebo leads pelo WhatsApp...',
      options: [['never', 'Ainda não anuncio', 'Quero começar com uma estrutura bem planejada', '01'], ['active', 'Já tenho campanhas ativas', 'Quero melhorar gestão, estrutura ou desempenho', '02'], ['paused', 'Já anunciei e parei', 'Quero retomar com uma nova estratégia', '03']]
    },
    social: {
      title: 'Como estão suas redes sociais hoje?', subtitle: 'Isso ajuda a definir o nível de planejamento e gestão necessário.', fieldLabel: 'Conte um pouco do cenário atual (opcional)', placeholder: 'Ex.: posto sem frequência, tenho Instagram mas não tenho calendário de conteúdo...',
      options: [['inactive', 'Estão pouco ativas', 'Preciso criar consistência e presença', '01'], ['internal', 'Eu mesmo faço as postagens', 'Quero profissionalizar estratégia e conteúdo', '02'], ['managed', 'Já tenho alguém cuidando', 'Quero rever estratégia ou elevar a qualidade', '03']]
    },
    other: {
      title: 'Conte o ponto de partida', subtitle: 'Escolha a situação mais próxima do seu projeto.', fieldLabel: 'Explique brevemente o que você precisa (opcional)', placeholder: 'Descreva a ideia, problema ou oportunidade...',
      options: [['new', 'É uma ideia nova', 'Ainda não existe uma solução em funcionamento', '01'], ['existing', 'Já existe algo', 'Tenho uma solução e quero melhorar ou complementar', '02'], ['problem', 'Tenho um problema específico', 'Quero descobrir qual solução digital faz mais sentido', '03']]
    }
  };
  return configs[budgetState.service] || configs.other;
}

function budgetQuestion(title, subtitle, body) {
  return `<div class="budget-question-head"><h2 id="budget-question-title">${title}</h2><p>${subtitle}</p></div>${body}<p class="budget-error" id="budget-error" role="alert"></p>`;
}

function renderBudgetStep() {
  if (!budgetContent) return;
  budgetComplete = false;
  const currentAside = asideCopy[budgetStep];
  if (budgetAsideNumber) budgetAsideNumber.textContent = String(budgetStep).padStart(2, '0');
  if (budgetAsideKicker) budgetAsideKicker.textContent = currentAside[0];
  if (budgetAsideTitle) budgetAsideTitle.textContent = currentAside[1];
  if (budgetAsideText) budgetAsideText.textContent = currentAside[2];
  if (budgetMobileCurrent) budgetMobileCurrent.textContent = String(budgetStep);
  budgetProgress.forEach((segment, index) => {
    segment.classList.toggle('done', index + 1 < budgetStep);
    segment.classList.toggle('active', index + 1 === budgetStep);
  });
  budgetProgressElement?.setAttribute('aria-valuenow', String(budgetStep));
  budgetProgressElement?.setAttribute('aria-valuetext', `Etapa ${budgetStep} de 6`);
  if (budgetBack) budgetBack.hidden = budgetStep === 1;
  if (budgetNext) budgetNext.textContent = budgetStep === 6 ? 'Gerar diagnóstico' : 'Continuar';

  if (budgetStep === 1) {
    budgetContent.innerHTML = budgetQuestion('O que você precisa?', 'Escolha a opção mais próxima do seu projeto.', renderOptionList(serviceOptions, budgetState.service));
  }

  if (budgetStep === 2) {
    const config = getStepTwoConfig();
    budgetContent.innerHTML = budgetQuestion(config.title, config.subtitle, `${renderOptionList(config.options, budgetState.current)}
      <div class="budget-field"><label for="budget-current-tool">${config.fieldLabel}</label><input id="budget-current-tool" type="text" value="${escapeBudgetValue(budgetState.currentTool)}" placeholder="${config.placeholder}" autocomplete="off"></div>`);
  }

  if (budgetStep === 3) {
    budgetContent.innerHTML = budgetQuestion('Qual resultado você quer alcançar?', 'Escolha o objetivo que melhor representa o que você espera do projeto.', renderOptionList(goalOptions, budgetState.goal));
  }

  if (budgetStep === 4) {
    budgetContent.innerHTML = budgetQuestion('Em que estágio está o projeto?', 'Isso ajuda a entender quanto planejamento ainda precisa acontecer.', `${renderOptionList(stageOptions, budgetState.stage)}
      <div class="budget-field"><label for="budget-details">O que não pode faltar? (opcional)</label><textarea id="budget-details" placeholder="Funcionalidades, páginas, referências, integrações ou qualquer detalhe importante...">${escapeBudgetValue(budgetState.details)}</textarea></div>`);
  }

  if (budgetStep === 5) {
    budgetContent.innerHTML = budgetQuestion('Quando você gostaria de começar?', 'Defina o momento mais próximo da sua realidade. O investimento pode ficar em aberto.', `${renderOptionList(deadlineOptions, budgetState.deadline)}
      <fieldset class="budget-fieldset"><legend>Faixa de investimento (opcional)</legend><div class="budget-options">${investmentOptions.map((item) => budgetOption(item[0], item[1], item[2], 'R$', budgetState.investment === item[0])).join('')}</div></fieldset>`);
  }

  if (budgetStep === 6) {
    budgetContent.innerHTML = budgetQuestion('Como podemos falar com você?', 'Preencha seus dados. Nada será enviado automaticamente: você confirma o envio pelo WhatsApp no final.', `<div class="budget-fields-two">
      <div class="budget-field"><label for="budget-name">Nome *</label><input id="budget-name" name="name" type="text" value="${escapeBudgetValue(budgetState.name)}" placeholder="Seu nome" autocomplete="name" required></div>
      <div class="budget-field"><label for="budget-company">Empresa (opcional)</label><input id="budget-company" name="company" type="text" value="${escapeBudgetValue(budgetState.company)}" placeholder="Nome da empresa" autocomplete="organization"></div>
    </div>
    <div class="budget-fields-two">
      <div class="budget-field"><label for="budget-whatsapp">WhatsApp *</label><input id="budget-whatsapp" name="whatsapp" type="tel" value="${escapeBudgetValue(budgetState.whatsapp)}" placeholder="(00) 00000-0000" autocomplete="tel" inputmode="tel" required></div>
      <div class="budget-field"><label for="budget-email">E-mail (opcional)</label><input id="budget-email" name="email" type="email" value="${escapeBudgetValue(budgetState.email)}" placeholder="voce@empresa.com" autocomplete="email" inputmode="email"></div>
    </div>`);
  }

  bindBudgetStepInputs();
  requestAnimationFrame(() => budgetContent.querySelector('button, input, textarea')?.focus({ preventScroll: true }));
}

function escapeBudgetValue(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bindBudgetStepInputs() {
  const options = budgetContent?.querySelectorAll('[data-budget-option]') || [];
  options.forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.dataset.budgetOption;
      if (budgetStep === 1) {
        budgetState.service = value;
        budgetState.serviceLabel = serviceOptions.find((item) => item[0] === value)?.[1] || value;
        budgetState.current = '';
        budgetState.currentLabel = '';
        budgetState.currentTool = '';
      } else if (budgetStep === 2) {
        budgetState.current = value;
        budgetState.currentLabel = getStepTwoConfig().options.find((item) => item[0] === value)?.[1] || value;
      } else if (budgetStep === 3) {
        budgetState.goal = value;
        budgetState.goalLabel = goalOptions.find((item) => item[0] === value)?.[1] || value;
      } else if (budgetStep === 4) {
        budgetState.stage = value;
        budgetState.stageLabel = stageOptions.find((item) => item[0] === value)?.[1] || value;
      } else if (budgetStep === 5) {
        const deadline = deadlineOptions.find((item) => item[0] === value);
        const investment = investmentOptions.find((item) => item[0] === value);
        if (deadline) {
          budgetState.deadline = value;
          budgetState.deadlineLabel = deadline[1];
        }
        if (investment) {
          budgetState.investment = value;
          budgetState.investmentLabel = investment[1];
        }
      }
      options.forEach((item) => {
        if (budgetStep === 5) {
          const isDeadline = deadlineOptions.some((deadline) => deadline[0] === item.dataset.budgetOption);
          const isInvestment = investmentOptions.some((investment) => investment[0] === item.dataset.budgetOption);
          const selected = (isDeadline && item.dataset.budgetOption === budgetState.deadline) || (isInvestment && item.dataset.budgetOption === budgetState.investment);
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        } else {
          const selected = item.dataset.budgetOption === value;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        }
      });
      clearBudgetError();
    });
  });

  budgetContent?.querySelector('#budget-current-tool')?.addEventListener('input', (event) => { budgetState.currentTool = event.target.value; });
  budgetContent?.querySelector('#budget-details')?.addEventListener('input', (event) => { budgetState.details = event.target.value; });
  budgetContent?.querySelector('#budget-name')?.addEventListener('input', (event) => { budgetState.name = event.target.value; clearBudgetError(); });
  budgetContent?.querySelector('#budget-company')?.addEventListener('input', (event) => { budgetState.company = event.target.value; });
  budgetContent?.querySelector('#budget-whatsapp')?.addEventListener('input', (event) => { budgetState.whatsapp = event.target.value; clearBudgetError(); });
  budgetContent?.querySelector('#budget-email')?.addEventListener('input', (event) => { budgetState.email = event.target.value; });
}

function clearBudgetError() {
  const error = document.querySelector('#budget-error');
  if (error) error.textContent = '';
}

function showBudgetError(message) {
  const error = document.querySelector('#budget-error');
  if (error) error.textContent = message;
}

function validateBudgetStep() {
  if (budgetStep === 1 && !budgetState.service) return 'Escolha o tipo de projeto para continuar.';
  if (budgetStep === 2 && !budgetState.current) return 'Escolha a opção que melhor representa sua situação atual.';
  if (budgetStep === 3 && !budgetState.goal) return 'Escolha o principal resultado que você quer alcançar.';
  if (budgetStep === 4 && !budgetState.stage) return 'Escolha em que estágio seu projeto está.';
  if (budgetStep === 5 && !budgetState.deadline) return 'Escolha quando você gostaria de começar.';
  if (budgetStep === 6) {
    budgetState.name = document.querySelector('#budget-name')?.value.trim() || budgetState.name.trim();
    budgetState.company = document.querySelector('#budget-company')?.value.trim() || budgetState.company.trim();
    budgetState.whatsapp = document.querySelector('#budget-whatsapp')?.value.trim() || budgetState.whatsapp.trim();
    budgetState.email = document.querySelector('#budget-email')?.value.trim() || budgetState.email.trim();
    if (budgetState.name.length < 2) return 'Informe seu nome para concluir o diagnóstico.';
    if (budgetState.whatsapp.replace(/\D/g, '').length < 10) return 'Informe um WhatsApp válido com DDD.';
    if (budgetState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(budgetState.email)) return 'Confira o e-mail informado.';
  }
  return '';
}

function buildBudgetMessage() {
  const lines = [
    'Olá! Fiz o diagnóstico de projeto no site da RocketTech e gostaria de conversar sobre o orçamento.',
    '',
    `Projeto: ${budgetState.serviceLabel}`,
    `Situação atual: ${budgetState.currentLabel}${budgetState.currentTool ? ` | ${budgetState.currentTool}` : ''}`,
    `Objetivo principal: ${budgetState.goalLabel}`,
    `Estágio: ${budgetState.stageLabel}`,
    budgetState.details ? `Detalhes: ${budgetState.details}` : '',
    `Prazo: ${budgetState.deadlineLabel}`,
    `Investimento: ${budgetState.investmentLabel || 'Ainda não definido'}`,
    '',
    `Nome: ${budgetState.name}`,
    budgetState.company ? `Empresa: ${budgetState.company}` : '',
    `Meu WhatsApp: ${budgetState.whatsapp}`,
    budgetState.email ? `E-mail: ${budgetState.email}` : ''
  ].filter(Boolean);
  return lines.join('\n');
}

function renderBudgetResult() {
  budgetComplete = true;
  if (budgetAsideNumber) budgetAsideNumber.textContent = 'OK';
  if (budgetAsideKicker) budgetAsideKicker.textContent = 'DIAGNÓSTICO CONCLUÍDO';
  if (budgetAsideTitle) budgetAsideTitle.textContent = 'Seu projeto já está mais claro.';
  if (budgetAsideText) budgetAsideText.textContent = 'Revise o resumo e envie para a RocketTech. A conversa continua no WhatsApp.';
  budgetProgress.forEach((segment) => { segment.classList.remove('active'); segment.classList.add('done'); });
  budgetProgressElement?.setAttribute('aria-valuenow', '6');
  budgetProgressElement?.setAttribute('aria-valuetext', 'Diagnóstico concluído');
  if (budgetBack) budgetBack.hidden = true;
  if (budgetNext) budgetNext.hidden = true;

  const message = buildBudgetMessage();
  const waUrl = `https://wa.me/${BUDGET_PHONE}?text=${encodeURIComponent(message)}`;
  const rows = [
    ['Projeto', budgetState.serviceLabel],
    ['Situação atual', `${budgetState.currentLabel}${budgetState.currentTool ? ` · ${budgetState.currentTool}` : ''}`],
    ['Objetivo', budgetState.goalLabel],
    ['Estágio', budgetState.stageLabel],
    ['Prazo', budgetState.deadlineLabel],
    ['Investimento', budgetState.investmentLabel || 'Ainda não definido']
  ];
  budgetContent.innerHTML = `<div class="budget-success-mark" aria-hidden="true">RT</div>
    <div class="budget-question-head"><h2 id="budget-question-title">Diagnóstico concluído.</h2><p>Seu resumo está pronto. Nada foi enviado ainda.</p></div>
    <div class="budget-summary">${rows.map(([label, value]) => `<div class="budget-summary-item"><span>${label}</span><strong>${escapeBudgetValue(value)}</strong></div>`).join('')}</div>
    <a class="budget-whatsapp" href="${waUrl}" target="_blank" rel="noopener noreferrer">Enviar diagnóstico no WhatsApp</a>
    <button class="budget-restart" type="button" id="budget-restart">Refazer diagnóstico</button>`;
  document.querySelector('#budget-restart')?.addEventListener('click', resetBudgetDiagnostic);
  requestAnimationFrame(() => budgetContent.querySelector('.budget-whatsapp')?.focus({ preventScroll: true }));
}

function resetBudgetDiagnostic() {
  Object.keys(budgetState).forEach((key) => { budgetState[key] = ''; });
  budgetStep = 1;
  budgetComplete = false;
  if (budgetNext) budgetNext.hidden = false;
  renderBudgetStep();
}

function openBudgetDiagnostic() {
  if (!budgetModal) return;
  closeMenu();
  budgetLastFocused = document.activeElement;
  budgetModal.classList.add('is-open');
  budgetModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('budget-open');
  budgetBackground.forEach((element) => { element.inert = true; });
  if (budgetComplete) resetBudgetDiagnostic();
  else renderBudgetStep();
}

function closeBudgetDiagnostic() {
  if (!budgetModal) return;
  budgetModal.classList.remove('is-open');
  budgetModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('budget-open');
  budgetBackground.forEach((element) => { element.inert = false; });
  budgetLastFocused?.focus?.();
}

function getBudgetFocusableElements() {
  if (!budgetModal) return [];
  return [...budgetModal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
}

function trapBudgetFocus(event) {
  if (event.key !== 'Tab' || !budgetModal?.classList.contains('is-open')) return;
  const focusable = getBudgetFocusableElements();
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

budgetOpeners.forEach((opener) => opener.addEventListener('click', openBudgetDiagnostic));
budgetClosers.forEach((closer) => closer.addEventListener('click', closeBudgetDiagnostic));
budgetBack?.addEventListener('click', () => {
  if (budgetStep <= 1) return;
  budgetStep -= 1;
  renderBudgetStep();
});

budgetForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const error = validateBudgetStep();
  if (error) {
    showBudgetError(error);
    return;
  }
  if (budgetStep === 6) {
    renderBudgetResult();
    return;
  }
  budgetStep += 1;
  renderBudgetStep();
});

document.addEventListener('keydown', (event) => {
  if (!budgetModal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    closeBudgetDiagnostic();
    return;
  }
  trapBudgetFocus(event);
});
