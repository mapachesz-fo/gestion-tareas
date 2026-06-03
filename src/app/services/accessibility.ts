import { Injectable, signal } from '@angular/core';

export type FontSize = 'normal' | 'large' | 'xlarge';

@Injectable({
  providedIn: 'root',
})
export class AccessibilityService {
  readonly fontSize = signal<FontSize>('normal');
  readonly isDarkMode = signal(false);
  readonly isReading = signal(false);

  private readingElements: Element[] = [];
  private readingIndex = 0;
  private readingCanceled = false;

  constructor() {
    const saved = localStorage.getItem('accessibility');
    if (saved) {
      const state = JSON.parse(saved);
      this.fontSize.set(state.fontSize ?? 'normal');
      this.isDarkMode.set(state.darkMode ?? false);
      this.applyState();
    }
  }

  private saveState() {
    localStorage.setItem(
      'accessibility',
      JSON.stringify({
        fontSize: this.fontSize(),
        darkMode: this.isDarkMode(),
      }),
    );
  }

  private applyState() {
    const html = document.documentElement;
    html.setAttribute('data-font-size', this.fontSize());
    if (this.isDarkMode()) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    this.applyState();
    this.saveState();
  }

  increaseFontSize() {
    const sizes: FontSize[] = ['normal', 'large', 'xlarge'];
    const idx = sizes.indexOf(this.fontSize());
    if (idx < sizes.length - 1) {
      this.fontSize.set(sizes[idx + 1]);
      this.applyState();
      this.saveState();
    }
  }

  decreaseFontSize() {
    const sizes: FontSize[] = ['normal', 'large', 'xlarge'];
    const idx = sizes.indexOf(this.fontSize());
    if (idx > 0) {
      this.fontSize.set(sizes[idx - 1]);
      this.applyState();
      this.saveState();
    }
  }

  resetFontSize() {
    this.fontSize.set('normal');
    this.applyState();
    this.saveState();
  }

  readScreen() {
    if (this.isReading()) {
      this.stopReading();
      return;
    }

    const main = document.querySelector('.contenido');
    if (!main) return;

    this.readingElements = this.collectTextElements(main);
    if (this.readingElements.length === 0) return;

    this.readingCanceled = false;
    this.readingIndex = 0;
    this.isReading.set(true);
    this.readNext();
  }

  stopReading() {
    this.readingCanceled = true;
    this.isReading.set(false);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.readingElements.forEach(el => el.classList.remove('sr-highlight'));
    this.readingElements = [];
  }

  private collectTextElements(root: Element): Element[] {
    const seen = new Set<Element>();
    const elements: Element[] = [];
    const skipTags = new Set([
      'script', 'style', 'noscript', 'app-root', 'router-outlet',
      'mat-icon', 'svg',
    ]);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (!node.textContent?.trim()) continue;

      const parent = node.parentElement;
      if (!parent || seen.has(parent)) continue;

      const tag = parent.tagName.toLowerCase();
      if (skipTags.has(tag)) continue;

      if (this.isHidden(parent)) continue;

      seen.add(parent);
      elements.push(parent);
    }

    return elements;
  }

  private isHidden(el: Element): boolean {
    const style = window.getComputedStyle(el);
    return (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      Number.parseFloat(style.width as string) === 0
    );
  }

  private readNext() {
    if (this.readingCanceled || this.readingIndex >= this.readingElements.length) {
      this.isReading.set(false);
      this.readingElements.forEach(el => el.classList.remove('sr-highlight'));
      return;
    }

    const el = this.readingElements[this.readingIndex];

    this.readingElements.forEach(e => e.classList.remove('sr-highlight'));
    el.classList.add('sr-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const text = (el.textContent ?? '').trim();
    if (!text) {
      this.readingIndex++;
      this.readNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-CL';
    utterance.rate = 0.85;

    utterance.onend = () => {
      el.classList.remove('sr-highlight');
      this.readingIndex++;
      this.readNext();
    };

    utterance.onerror = () => {
      el.classList.remove('sr-highlight');
      this.readingIndex++;
      this.readNext();
    };

    window.speechSynthesis.speak(utterance);
  }
}
