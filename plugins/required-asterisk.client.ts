// Affiche en rouge l'astérisque final des labels de champs obligatoires ("Nom *").
// L'astérisque est écrit dans les textes (i18n ou template) : plutôt que de le
// sortir de chaque libellé, on le décore ici. Le nœud texte reste celui de Vue
// (seul son contenu est raccourci) et un <span> est ajouté juste après.
const MARK = 'data-req-star'
const TRAILING = /\s\*\s*$/

function decorate(label: Element) {
  const last = label.lastChild
  if (last && last.nodeType === 1 && (last as Element).hasAttribute(MARK)) {
    const prev = last.previousSibling
    if (prev && prev.nodeType === 3 && TRAILING.test(prev.nodeValue || '')) {
      prev.nodeValue = (prev.nodeValue || '').replace(TRAILING, ' ')
    }
    return
  }
  let node: ChildNode | null = last
  if (!node || node.nodeType !== 3 || !TRAILING.test(node.nodeValue || '')) return
  node.nodeValue = (node.nodeValue || '').replace(TRAILING, ' ')
  const star = document.createElement('span')
  star.className = 'text-danger'
  star.setAttribute(MARK, '')
  star.textContent = '*'
  label.appendChild(star)
}

function scan(root: ParentNode) {
  root.querySelectorAll('label').forEach(decorate)
}

export default defineNuxtPlugin(() => {
  let queued = false
  const run = () => {
    queued = false
    scan(document)
  }
  const observer = new MutationObserver(() => {
    if (queued) return
    queued = true
    requestAnimationFrame(run)
  })
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  scan(document)
})
