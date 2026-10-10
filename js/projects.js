/* Prototype link configuration — one entry per project.
   Each project lists only the links it actually has; missing keys are skipped.
   Render order is always: caseStudy → desktop → tablet → mobile → other (project-specific links).
   ▶ TO ADD / CHANGE A LINK: edit the URL here — the detail pages render the buttons from this file. */
(function () {
  var FIGMA = 'https://www.figma.com/proto/';
  var LABELS = {
    caseStudy: 'Explore Case Study',
    desktop: 'Explore Desktop Experience',
    tablet: 'Explore Tablet Experience',
    mobile: 'Explore Mobile Experience'
  };
  var ORDER = ['caseStudy', 'desktop', 'tablet', 'mobile'];

  window.PORTFOLIO_PROJECTS = {
    carenest: {
      name: 'CareNest',
      // Single prototype link with no case-study/device category; kept with its original label.
      other: [{
        label: 'View Interactive Prototype',
        url: 'https://www.figma.com/proto/WPG4sbxiSQUj0ecKjQGFDm/CareNest-Healthcare-%E2%80%94-App-Design?node-id=3-2&page-id=0%3A1&starting-point-node-id=3%3A2&t=b1rsc3Xqp2QJ4C3u-1'
      }]
    },
    gapmap: {
      name: 'GapMap',
      caseStudy: 'https://www.figma.com/proto/v0eziUaygZnIIdMWLPDssk/GapMap-%E2%80%94-Case-Study?node-id=149-646&viewport=183%2C287%2C0.07&t=v4VYJvV9mlilgxhB-1&scaling=min-zoom&content-scaling=fixed&page-id=127%3A422',
      // Role-based flows (not device-based), kept with their original labels.
      other: [
        { label: 'Explore Learner Flow', url: 'https://www.figma.com/proto/v0eziUaygZnIIdMWLPDssk/GapMap-%E2%80%94-Case-Study?node-id=32-2&page-id=30%3A2&starting-point-node-id=32%3A2&t=VudNnbUB6vPQ3AQd-1' },
        { label: 'Explore Mentor Flow', url: 'https://www.figma.com/proto/v0eziUaygZnIIdMWLPDssk/GapMap-%E2%80%94-Case-Study?node-id=38-619&page-id=30%3A2&starting-point-node-id=38%3A619&scaling=min-zoom&content-scaling=fixed&show-proto-sidebar=1&t=VudNnbUB6vPQ3AQd-1' }
      ]
    },
    finova: {
      name: 'Finova',
      caseStudy: 'https://www.figma.com/proto/rtJuW99kZ8U4GKlB4bbvBu/Finova-App-%E2%80%94-Hi-Fi-Screens?node-id=68-3&page-id=68%3A2&scaling=min-zoom&content-scaling=fixed&t=EGkIvGfpWyHNpnSk-1',
      desktop: 'https://www.figma.com/proto/rtJuW99kZ8U4GKlB4bbvBu/Finova-App-%E2%80%94-Hi-Fi-Screens?node-id=213-74&viewport=443%2C65%2C0.09&t=wwJEzoKjv8096Gr6-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=209%3A2&page-id=148%3A2',
      mobile: 'https://www.figma.com/proto/rtJuW99kZ8U4GKlB4bbvBu/Finova-App-%E2%80%94-Hi-Fi-Screens?node-id=32-16&viewport=-352%2C-2636%2C0.29&t=jaDkHOSFRhlapCxO-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=2%3A2&show-proto-sidebar=1&page-id=0%3A1'
    },
    bundle: {
      name: 'Bundle',
      caseStudy: 'https://www.figma.com/proto/lFzORxHRjncCrurb9VPHd4/Bundle-%E2%80%94-Goal-based-E-commerce--Desktop-?node-id=160-9633&viewport=168%2C-365%2C0.04&t=c2uTcAWXgSoDy81H-1&scaling=min-zoom&content-scaling=fixed&page-id=114%3A3696',
      desktop: 'https://www.figma.com/proto/lFzORxHRjncCrurb9VPHd4/Bundle-%E2%80%94-Goal-based-E-commerce--Desktop-?node-id=12-2&viewport=-11%2C1561%2C0.35&t=SaCfa5CcvzTP57X8-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=12%3A2&show-proto-sidebar=1&page-id=0%3A1',
      tablet: 'https://www.figma.com/proto/lFzORxHRjncCrurb9VPHd4/Bundle-%E2%80%94-Goal-based-E-commerce--Desktop-?page-id=75%3A3876&node-id=76-3979&starting-point-node-id=76%3A3979&scaling=min-zoom&content-scaling=fixed&t=0AaxFuWGhOOdg7oi-1',
      mobile: 'https://www.figma.com/proto/lFzORxHRjncCrurb9VPHd4/Bundle-%E2%80%94-Goal-based-E-commerce--Desktop-?node-id=89-7025&viewport=606%2C222%2C0.12&t=jiJbiodq823Qhutz-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=89%3A7025&show-proto-sidebar=1&page-id=84%3A6743'
    }

  };

  function valid(u) { return typeof u === 'string' && u.indexOf(FIGMA) === 0; }

  function linksFor(p) {
    var out = [];
    ORDER.forEach(function (k) { if (valid(p[k])) out.push({ label: LABELS[k], url: p[k] }); });
    (p.other || []).forEach(function (o) { if (o && o.label && valid(o.url)) out.push(o); });
    return out;
  }

  function render() {
    var hosts = document.querySelectorAll('[data-project-links]');
    Array.prototype.forEach.call(hosts, function (host) {
      var p = window.PORTFOLIO_PROJECTS[host.getAttribute('data-project-links')];
      if (!p) return;
      host.textContent = '';
      host.setAttribute('aria-label', p.name + ' prototypes and case study');
      var list = linksFor(p);
      host.setAttribute('data-count', list.length);
      list.forEach(function (l, i) {
        var a = document.createElement('a');
        a.className = 'btn ' + (i === 0 ? 'btn--solid' : 'btn--ghost') + ' project-detail__link';
        a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.appendChild(document.createTextNode(l.label + ' '));
        var s = document.createElement('span');
        s.className = 'btn__arrow btn__arrow--out'; s.setAttribute('aria-hidden', 'true'); s.textContent = '↗';
        a.appendChild(s); host.appendChild(a);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
