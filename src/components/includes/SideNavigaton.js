import React from 'react';
import Controller from '../Controller';
import M from 'materialize-css';
import { Link, NavLink } from 'react-router-dom';
class SideNavigation extends Controller {
    constructor(props){
        super(props);
        this.logout.bind(this);
    }
    componentDidMount(){
        var sidenav = document.querySelectorAll('.sidenav');
        M.Sidenav.init(sidenav, {});
        var dropdown = document.querySelectorAll('.dropdown-trigger');
        M.Dropdown.init(dropdown, {});
    }
    logout = (e) => {
        this.token_remove(); 
    }
    render(){
        const logo = require('../assets/images/logo.png');
        const {user} = this.props;
        return (
            <div className="side-navigation">
                <div id="fixed-header" className="">
                    <div className="inner">
                        <div className="logo"><Link to="#" className="logo-container">
                            <img src={logo} alt="" /></Link> 
                        </div>
                        <Link to="#" data-target="main-menu" className="sidenav-trigger"> <i></i><i></i><i></i></Link>
                        <ul className="inline top-menu">
                            <li>
                                <Link className='dropdown-trigger' to='#' data-target='dropdown1'>
                                {user.name}
                                <i className="material-icons">account_circle</i></Link>
                                <ul id='dropdown1' className='dropdown-content'>
                                    <li className="divider" tabIndex="-1"></li>
                                    <li><Link to="/login" onClick={this.logout}>
                                        <i className="material-icons">exit_to_app</i>Logout</Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="header" className="dark">
                    <div className="nav-wrapper">
                        <ul id="main-menu" className="sidenav">
                        <li><NavLink to="/todo" title="ToDo" activeClassName="active">
                            <i className="material-icons">assignment</i>ToDo</NavLink>
                        </li>
                        {user.role && user.role === 'admin' && 
                            <li><NavLink to="/users" title="Users" activeClassName="active">
                                <i className="material-icons">group</i>Users</NavLink>
                            </li>
                        }
                        {user.role && user.role === 'admin' && 
                            <li><NavLink to="/projects" title="Projects" activeClassName="active">
                                <i className="material-icons">view_list</i>Projects</NavLink>
                            </li>
                        }
                        </ul>
                    </div>
                </div>
            </div>)
    }
}
export default SideNavigation;
