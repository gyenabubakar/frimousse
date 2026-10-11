function hasBlankLineBetween(earlier, later) {
  // A line gap larger than one means a blank line (or a separating comment) sits between
  // the two nodes — either way the code reads as two visually distinct groups.
  return later.loc.start.line - earlier.loc.end.line > 1;
}

/** Flag a run of more than `max` consecutive statements with no blank line between them.
 *  No off-the-shelf rule does this; @stylistic only reasons about adjacent pairs. */
export const maxConsecutiveStatements = {
  meta: {
    type: 'suggestion',
    fixable: 'whitespace',
    docs: { description: 'Break dense blocks into groups separated by blank lines.' },
    schema: [
      {
        type: 'object',
        properties: { max: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      congested:
        'More than {{max}} consecutive statements without a blank line — separate them into smaller groups.',
    },
  },
  create(context) {
    const max = context.options[0]?.max ?? 4;

    function check(statements) {
      let runStart = 0;

      for (let index = 1; index <= statements.length; index++) {
        const runEnded =
          index === statements.length ||
          hasBlankLineBetween(statements[index - 1], statements[index]);
        if (!runEnded) continue;

        if (index - runStart > max) {
          const overflow = statements[runStart + max];
          context.report({
            node: overflow,
            messageId: 'congested',
            data: { max },
            fix(fixer) {
              return fixer.insertTextBefore(overflow, '\n');
            },
          });
        }

        runStart = index;
      }
    }

    return {
      BlockStatement(node) {
        check(node.body);
      },
      SwitchCase(node) {
        check(node.consequent);
      },
    };
  },
};

/** Blank line above the final `return` of a longer function (>= minStatements), so the
 *  return reads as its own conclusion instead of glued to the work above it. Short
 *  (3-4 statement) functions are left alone. */
export const paddingBeforeFinalReturn = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: "Blank line above a long function's final return statement." },
    schema: [
      {
        type: 'object',
        properties: { minStatements: { type: 'integer', minimum: 2 } },
        additionalProperties: false,
      },
    ],
    messages: {
      needsBlank: "Separate a long function's final return with a blank line above it.",
    },
  },
  create(context) {
    const minStatements = context.options[0]?.minStatements ?? 5;

    return {
      ReturnStatement(node) {
        const block = node.parent;
        if (!block || block.type !== 'BlockStatement') return;
        if (!block.parent || !/Function/.test(block.parent.type)) return;

        const body = block.body;
        if (body[body.length - 1] !== node || body.length < minStatements) return;

        const previous = body[body.length - 2];
        if (!previous || hasBlankLineBetween(previous, node)) return;

        context.report({
          node,
          messageId: 'needsBlank',
          fix(fixer) {
            return fixer.insertTextBefore(node, '\n');
          },
        });
      },
    };
  },
};

/** Blank line before each switch case that follows a case WITH a body. Stacked
 *  fall-through labels stay together — which @stylistic's `case` selector can't express. */
export const switchCasePadding = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    docs: { description: 'Separate body-bearing switch cases with a blank line.' },
    schema: [
      {
        type: 'object',
        properties: { minCases: { type: 'integer', minimum: 2 } },
        additionalProperties: false,
      },
    ],
    messages: {
      needsBlank: 'Put a blank line between switch cases so each case block reads on its own.',
    },
  },
  create(context) {
    const minCases = context.options[0]?.minCases ?? 3;

    return {
      SwitchStatement(node) {
        if (node.cases.length < minCases) return;

        for (let index = 1; index < node.cases.length; index++) {
          const previous = node.cases[index - 1];
          const current = node.cases[index];
          if (!previous.consequent.length) continue;
          if (hasBlankLineBetween(previous, current)) continue;

          context.report({
            node: current,
            messageId: 'needsBlank',
            fix(fixer) {
              return fixer.insertTextBefore(current, '\n');
            },
          });
        }
      },
    };
  },
};
