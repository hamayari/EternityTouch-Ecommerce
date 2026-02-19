import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

// project import
import NavLeft from './NavLeft';
import NavRight from './NavRight';

import { ConfigContext } from '../../../contexts/ConfigContext';
import * as actionType from '../../../store/actions';

// ==============================|| NAV BAR ||============================== //

const NavBar = ({ setToken }) => {
  const [moreToggle, setMoreToggle] = useState(false);
  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  const { dispatch } = configContext;

  let headerClass = ['navbar', 'pcoded-header', 'navbar-expand-lg', 'headerpos-fixed'];
  if (layout === 'vertical') {
    headerClass = [...headerClass, 'headerpos-fixed'];
  }

  // Custom pink header style
  const headerStyle = {
    backgroundColor: '#FFC9C9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1009
  };

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let moreClass = ['mob-toggler'];
  let collapseClass = ['collapse navbar-collapse'];
  if (moreToggle) {
    moreClass = [...moreClass, 'on'];
    collapseClass = [...collapseClass, 'd-block'];
  }

  let navBar = (
    <React.Fragment>
      <div className="m-header">
        <Link to="#" className={toggleClass.join(' ')} id="mobile-collapse" onClick={navToggleHandler}>
          <span style={{ backgroundColor: '#000' }} />
        </Link>
        <Link to="#" className="b-brand">
          <span style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#000',
            letterSpacing: '1px',
            fontFamily: "'Great Vibes', cursive"
          }}>
            Eternity Touch
          </span>
        </Link>
        <Link to="#" className={moreClass.join(' ')} onClick={() => setMoreToggle(!moreToggle)}>
          <i className="feather icon-more-vertical" style={{ color: '#000' }} />
        </Link>
      </div>
      <div style={{ justifyContent: 'end' }} className={collapseClass.join(' ')}>
        <NavLeft />
        <NavRight setToken={setToken} />
      </div>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <header className={headerClass.join(' ')} style={headerStyle}>
        {navBar}
      </header>
    </React.Fragment>
  );
};

export default NavBar;
