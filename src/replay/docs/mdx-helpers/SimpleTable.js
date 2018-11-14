// @flow
import * as React from 'react';

type Props = {
  rows?: Array<{ [string]: string }>
};

const tableStyles = {
  padding: 0,
  tableLayout: 'auto',
  boxShadow: '0 0 0 1px #CED4DE',
  borderSpacing: 0,
  borderColor: 'gray',
  borderCollapse: 'collapse',
  borderStyle: 'hidden',
  borderRadius: '4px',
  overflowY: 'hidden',
  fontSize: '14px',
  color: '#13161F',
  width: '100%',
  display: 'table'
};

const theadStyles = {
  color: '#7D899C',
  background: '#EEF1F5',
  textAlign: 'left',
  fontSize: '14px',
  borderSpacing: 0,
  borderCollapse: 'collapse',
};

const trStyles = {
  orderSpacing: 0,
  borderCollapse: 'collapse'
};

const tdStyles = {
  padding: '20px',
  verticalAlign: 'top'
};

const tdItalicStyles = {
  ...tdStyles,
  fontStyle: 'italic',
  opacity: 0.5
};

const tdCodeStyles = {
  ...tdStyles,
  fontFamily: '"Source Code Pro",monospace',
  whiteSpace: 'nowrap'
};

const applyStyles = content => {
  if (content === '') {
    return tdItalicStyles;
  } else {
    return tdCodeStyles;
  }
}

const formatContent = content => {
  if (content === '') {
    return 'none';
  } else {
    return content;
  }
};

const SimpleTable = ({ rows }: Props) => {
  if (rows && rows.length) {
    const headers = Object.keys(rows[0]);
    return (
      <table style={tableStyles}>
        <thead style={theadStyles}>
          <tr style={trStyles}>
            {headers.map(header => (<th style={tdStyles}>{header}</th>))}
          </tr>
        </thead>
        <tbody>
        {
          // $FlowFixMe Object.values is not understood.
          rows.map(row => (<tr style={trStyles}>{Object.values(row).map(value => <td style={applyStyles(value)}>{formatContent(value)}</td>)}</tr>))
        }
        </tbody>
      </table>
    );
  }
};

export default SimpleTable;
