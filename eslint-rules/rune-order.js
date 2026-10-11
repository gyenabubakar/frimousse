/**
 * Enforce a consistent order for Svelte 5 runes and lifecycle hooks within a
 * script's top-level statements:
 *   1. $state   (incl. $props, $bindable, $state.raw)
 *   2. $derived (incl. $derived.by)
 *   3. $effect  (incl. $effect.pre, $effect.root)
 *   4. function declarations
 *   5. on* lifecycle hooks (onMount, onDestroy, beforeUpdate, afterUpdate)
 *
 * Only categorized statements are checked against each other; anything else
 * (imports, plain consts, type aliases) may appear anywhere and is ignored.
 *
 * In a `.svelte` file the script statements live inside SvelteScriptElement.body;
 * in a plain `.svelte.ts`/`.svelte.js` module they're directly in Program.body.
 *
 * Autofixable: a violating statement list is reordered so the categorized
 * statements sit in rank order, while non-categorized statements keep their slot
 * and blank-line separators stay put. Leading comments travel with their statement.
 */

const RANK = {
  $props: 0,
  $bindable: 0,
  $state: 0,
  $derived: 1,
  $effect: 2,
};

const RANK_LABEL = ['$state', '$derived', '$effect', 'function', 'lifecycle hook'];

const LIFECYCLE_HOOKS = new Set(['onMount', 'onDestroy', 'beforeUpdate', 'afterUpdate']);

function runeName(callExpression) {
  let callee = callExpression.callee;
  if (callee.type === 'MemberExpression') callee = callee.object;
  if (callee.type === 'Identifier' && callee.name.startsWith('$')) return callee.name;

  return null;
}

function rankOfStatement(statement) {
  if (statement.type === 'VariableDeclaration') {
    for (const declaration of statement.declarations) {
      if (declaration.init?.type !== 'CallExpression') continue;

      const name = runeName(declaration.init);
      if (name !== null && name in RANK) return RANK[name];
    }

    return null;
  }

  if (statement.type === 'FunctionDeclaration') return 3;

  if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
    const call = statement.expression;
    const name = runeName(call);
    if (name !== null && name in RANK) return RANK[name];
    if (call.callee.type === 'Identifier' && LIFECYCLE_HOOKS.has(call.callee.name)) return 4;
  }

  return null;
}

/**
 * Reorder the categorized statements into rank order, leaving non-categorized
 * statements in place. Returns the replacement text for the whole region, or null
 * when nothing needs moving.
 */
function reorderedText(statements, sourceCode) {
  const ranks = statements.map(rankOfStatement);
  const categorizedSlots = [];

  for (let index = 0; index < statements.length; index++) {
    if (ranks[index] !== null) categorizedSlots.push(index);
  }

  const sortedSlots = [...categorizedSlots].sort(
    (left, right) => ranks[left] - ranks[right] || left - right,
  );

  const source = sourceCode.getText();

  function leadingStart(index) {
    const statement = statements[index];
    const previousEnd = index > 0 ? statements[index - 1].range[1] : 0;
    let start = statement.range[0];

    for (const comment of sourceCode.getCommentsBefore(statement)) {
      if (comment.range[0] >= previousEnd && comment.range[0] < start) start = comment.range[0];
    }

    return start;
  }

  // content[i] = leading comments + the statement (this travels when reordered).
  // separator[i] = the blank-line gap before it (positional — stays in its slot).
  const content = statements.map((statement, index) =>
    source.slice(leadingStart(index), statement.range[1]),
  );
  const separators = statements.map((_statement, index) =>
    index === 0 ? '' : source.slice(statements[index - 1].range[1], leadingStart(index)),
  );

  const contentBySlot = content.slice();
  categorizedSlots.forEach((slot, position) => {
    contentBySlot[slot] = content[sortedSlots[position]];
  });

  let rebuilt = '';

  for (let index = 0; index < statements.length; index++) {
    rebuilt += separators[index] + contentBySlot[index];
  }

  return { regionStart: leadingStart(0), regionEnd: statements.at(-1).range[1], rebuilt };
}

/** @type {import('eslint').Rule.RuleModule} */
export const runeOrder = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Order runes/hooks: $state, $derived, $effect, functions, on* hooks.' },
    fixable: 'code',
    schema: [],
    messages: {
      outOfOrder: 'A {{current}} must not appear after a {{previous}}. Order: {{order}}.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function check(statements) {
      let highestRank = -1;
      let highestLabel = '';
      const violations = [];

      for (const statement of statements) {
        const rank = rankOfStatement(statement);
        if (rank === null) continue;

        if (rank < highestRank) {
          violations.push({ statement, rank });
          continue;
        }

        highestRank = rank;
        highestLabel = RANK_LABEL[rank];
      }

      if (!violations.length) return;

      const { regionStart, regionEnd, rebuilt } = reorderedText(statements, sourceCode);
      violations.forEach(({ statement, rank }, position) => {
        context.report({
          node: statement,
          messageId: 'outOfOrder',
          data: {
            current: RANK_LABEL[rank],
            previous: highestLabel,
            order: RANK_LABEL.join(' → '),
          },
          // Attach the region rewrite to the first violation only — one fix resolves all.
          fix:
            position === 0
              ? (fixer) => fixer.replaceTextRange([regionStart, regionEnd], rebuilt)
              : undefined,
        });
      });
    }

    return {
      SvelteScriptElement(node) {
        check(node.body);
      },
      Program(node) {
        // Plain TS/JS module (.svelte.ts) — the .svelte case is covered above.
        if (node.body.some((statement) => statement.type === 'SvelteScriptElement')) return;

        check(node.body);
      },
    };
  },
};
