import React from "react";

export default function HelpTab() {
  return (
    <div className="content">
      <h3>Inserting variables</h3>
      <p>
        In your data, each value in the header row defines a variable name. The
        spam script generates one email for each subsequent row of data.
      </p>
      <p>
        Variables are stored in the <code>SPAM</code> object, and substitutions
        are done using <code>{`\${}`}</code> syntax. You can insert a variable
        named <code>xyz</code> into your email by writing{" "}
        <code>{`\${SPAM.xyz}`}</code> or by writing{" "}
        <code>{`\${SPAM["xyz"]}`}</code>. The latter syntax is necessary if your
        variable name contains special characters like spaces.
      </p>
      <p>
        The message that you write is evaulated as a Javascript{" "}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals"
          target="_blank"
          rel="noopener noreferrer"
        >
          template literal
        </a>
        . You can include arbitrary Javascript code inside the{" "}
        <code>{`\${}`}</code> expressions.
      </p>
      <p>
        In addition, you can access non-named data entries by index via the
        special value of <code>SPAM.ARGV</code>, an array that contains the
        entire data row. This can be used to generate things like
        variable-length tables inside your email.
      </p>

      <h3>Special characters</h3>
      <ul>
        <li>
          To insert a literal backslash (<code>\</code>), write <code>\\</code>.
        </li>
        <li>
          To insert a literal backtick (<code>`</code>), write <code>\`</code>.
        </li>
        <li>
          To insert a literal <code>{`\${`}</code>, escape the dollar sign like
          this: <code>{`\\\${}`}</code>.
        </li>
        <li>
          To insert a special Unicode code point, use{" "}
          <code>{`\\u{XXXXX}`}</code>.
        </li>
      </ul>

      <h3>Markdown</h3>
      <p>
        If you are using Markdown mode, you can apply formatting to your message
        with{" "}
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Markdown syntax
        </a>
        . The table below shows a few commonly used elements.
      </p>
      <table className="table is-bordered is-hoverable fixed-table">
        <thead className="has-background-light">
          <tr>
            <th>Markdown</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code># Heading 1</code>
            </td>
            <td className="title is-4 mx-0 my-0">Heading 1</td>
          </tr>

          <tr>
            <td>
              <code>## Heading 2</code>
            </td>
            <td className="title is-5">Heading 2</td>
          </tr>

          <tr>
            <td>
              <code>*Italic*</code>
            </td>
            <td>
              <em>Italic</em>
            </td>
          </tr>

          <tr>
            <td>
              <code>**Bold**</code>
            </td>
            <td className="has-text-weight-bold">Bold</td>
          </tr>

          <tr>
            <td>
              <code>~~Strikethrough~~</code>
            </td>
            <td>
              <s>Strikethrough</s>
            </td>
          </tr>

          <tr>
            <td>
              <code>* List</code>
            </td>
            <td>
              <ul className="mx-4 my-0">
                <li>List</li>
              </ul>
            </td>
          </tr>

          <tr>
            <td>
              <code>\`Code\`</code>
            </td>
            <td>
              <code>Code</code>
            </td>
          </tr>

          <tr>
            <td>
              <code>[Link](https://example.com)</code>
            </td>
            <td>
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
            </td>
          </tr>

          <tr>
            <td>
              <code>![Image](filename.jpg)</code>
            </td>
            <td>
              <img alt="" src="https://picsum.photos/100" />
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Because template literal evaluation occurs before Markdown parsing,
        you'll need to escape backticks and other special characters that are
        part of your Markdown. For example, writing{" "}
        <code>{`\\\`Code\\\``}</code> will result in the Markdown expression{" "}
        <code>{`\`Code\``}</code>.
      </p>
    </div>
  );
}
