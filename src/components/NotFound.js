import React from 'react';
import Controller from './Controller';
import firebase from './Firebase';
import SideNavigation from './includes/SideNavigaton';
class NotFound extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			isLoaded   : false,
		};
		this._isMounted = false;
	}
	async componentDidMount(){
		this._isMounted = true;
		var user = await this.token_validate();
		this.setState({isLoaded : true, user : user});
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	render(){
		const { isLoaded, user} = this.state;
		if(!isLoaded){
			return null;
		}
		return (<div className="main-wrapper">
			<div className="top-bg gradient-45deg-indigo-purple"></div>
			<SideNavigation user={user} />
			<div id="main-content">
				<div className="container">			
					<div className="page-title">
					    <h3 className="white-text">Page Not Found</h3>
					</div>
				</div>
			</div>
		</div>)
	}
}
export default NotFound;
