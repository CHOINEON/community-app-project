import {createGlobalStyle} from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body{
    max-width: 1100px;
    margin:0 auto;
    background: #fff;
    color:#2d2d2d;
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  b,strong{
    font-weight:700;
  }
  a{
    color:#2d2d2d;
  }
  p{
    margin: 10px 0;
    line-height: 1.5rem;
  }
  h1,h2,h3{
    margin-top: 20px;
    margin-bottom: 10px;
  }
  h1{
    font-weight: 600;
    font-size: 2em;
  }
  h2{
    font-weight: 600;
    font-size: 1.5em;
  }
  h3{
    font-weight: 600;
    font-size: 1.2em;
  }  
  blockquote{
    background-color: rgba(1,1,1, .1);
    padding: 15px;
    border-radius: 4px;
  }
`

export default GlobalStyles;