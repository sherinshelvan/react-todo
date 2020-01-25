import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import { Link, Redirect } from 'react-router-dom';
import SideNavigation from '../includes/SideNavigaton';
import M from 'materialize-css';
import $ from 'jquery';
class Users extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			isLoaded   : false,
			results : [], 
			undo : ""
		};
		this.doDelete.bind(this);
		this._isMounted = false;
	}
	async componentDidMount(){
		var self = this;
		this._isMounted = true;
		const {db} = this.state;
		var user = await this.token_validate();
		db.ref('users/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
	        	temp.push(results[key]);
	    	}
			this._isMounted && this.setState({
				isLoaded : true, 
				user : user,
				results : temp
			});
		});
		$(document).on("click", "button.toast-action", function(e){			
			if( self._isMounted && self.state.undo){
				var undo = self.state.undo;
				db.ref('users/'+undo.id).set(undo);
				self._isMounted && self.setState({undo : ""});
				M.Toast.dismissAll();
			}
		});
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	doDelete = (row) => {
		const {db} = this.state;
		this._isMounted && this.setState({undo : row});
		db.ref('users/'+row.id).remove();
		var toastHTML = '<span class="remove">User successfully removed.</span><button class="btn-flat toast-action">Undo</button>';
  		M.toast({html: toastHTML});
	}
	render(){
		const { isLoaded, results, user} = this.state;
		if(!isLoaded){
			return null;
		}
		if(isLoaded && user.role !== 'admin'){
			return <Redirect to="/access-denied" />
		}
		return (<div className="main-wrapper">
			<div className="top-bg gradient-45deg-indigo-purple"></div>
			<SideNavigation user={user} />
			<div id="main-content">
				<div className="container">			
					<div className="page-title">
					    <h3 className="white-text">Users</h3>
					</div>
					<div className="card">
						<div className="add-new right">
							<Link to="/users/add" className="btn-small waves-effect waves-light btn" title="Add New"><i className="material-icons">add</i></Link>
						</div>
					    <table>
					        <thead>
					            <tr>
					                <th >Name</th>
					                <th>Role</th>
					                <th>Status</th>
					                <th>Actions</th>
					            </tr>
					        </thead>
					        <tbody>
					        	{results.map((row, key) => 
									<tr key={key}>
										<td>{row.first_name} {row.last_name}</td>
										<td>{row.role}</td>
										<td>{row.active? "Active" : "Inactive"}</td>
										<td>
											<Link to={"/users/edit/"+row.id} title="Edit">
											<i className="material-icons">edit</i></Link>
											<Link to="#" onClick={e => this.doDelete(row)} title="Delete">
											<i className="material-icons">delete</i></Link>
										</td>
									</tr>
								)} 
								{results.length === 0 &&
									<tr>
										<td colSpan="4">No results found.</td>
						            </tr>
								}   
					        </tbody>
					    </table>
					</div>
				</div>
			</div>
		</div>)
	}
}
export default Users;
