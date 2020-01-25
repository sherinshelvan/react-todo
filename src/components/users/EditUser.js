import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import M from 'materialize-css';
import { Link, Redirect } from 'react-router-dom';
import md5 from 'md5';
import SideNavigation from '../includes/SideNavigaton';
var form = {
	username : "",
	first_name : "",
	last_name : "",
	password : "",
	role : "",
	active : true,
	id : Date.now()
};
class EditUser extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			disableSubmit : false, 
			form : JSON.parse(JSON.stringify(form)),
			isLoaded   : false,
			backup : ''
		};
		this.doSubmit.bind(this);
		this._isMounted = false;
		this.inputValueChange.bind(this);
	}
	async componentDidMount(){
		this._isMounted = true;
		const {match : {params}} = this.props;
		const {db, form} = this.state;
		form.id = Date.now();
		this._isMounted && this.setState({form : form});
		var user = await this.token_validate();
		if(params && params.id){
			var snapshot = await db.ref('users/'+params.id).once('value');
			var data = snapshot.val();
			if(!data){
				this.props.history.push("/404");
			}
			this._isMounted && data && this.setState({form : JSON.parse(JSON.stringify(data)), backup : data});
		}
		db.ref('roles/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
	        	temp.push(results[key]);
	    	}
			this._isMounted && this.setState({
				isLoaded : true, 
				user : user,
				roles : temp
			});
			var elems = document.querySelectorAll('select');
    		M.FormSelect.init(elems, {});
		});
		
		// this._isMounted && this.setState({isLoaded : true, user : user});
		
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	doSubmit = (event) => {
		event.preventDefault();
		const {form, db, disableSubmit, backup} = this.state;
		if(!disableSubmit){
			if(backup === "" || (backup && form.password !== backup.password)){
				form.password = md5(form.password);
			}
			this.setState({disableSubmit : true});
			db.ref('users/'+form.id).set(form);
    		M.toast({html: '<span>Users successfully updated.</span>'});
    		this.props.history.push("/users");
	    }
	}
	inputValueChange = (e, value = "") => {
		let {form, disableSubmit} = this.state
		form[e.target.name] = value!=="" ? value : e.target.value;
		disableSubmit = true;
		if(form.username && form.first_name && form.last_name && form.password
			&& form.role
		){
			disableSubmit = false;
		}
		this.setState({form : form, disableSubmit : disableSubmit});
	}
	render(){
		var {isLoaded, disableSubmit, form, user, roles} = this.state;
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
					    <h3 className="white-text">{form.username?"Edit":"Add"} User</h3>
					</div>
					<form action="" onSubmit={this.doSubmit} method="post">
						<div className="card">
							<div className="go-back left">
								<Link to="/projects"><i className="material-icons right">arrow_back</i></Link>
							</div>
							<div className="inner">
							    <div className="input-field">
							       <input id="username"
						          	defaultValue={form.username}
						          	name="username"
						          	onChange={e => this.inputValueChange(e)}
						          	type="text" required className="validate" />
						          	<label htmlFor="username" className={form.username ? "active" : ""}>Username</label>
						          	<span className="helper-text" data-error="Required field" ></span>
							    </div>
							    <div className="row">
								    <div className="input-field col s6">
								       <input id="first_name"
							          	defaultValue={form.first_name}
							          	name="first_name"
							          	onChange={e => this.inputValueChange(e)}
							          	type="text" required className="validate" />
							          	<label htmlFor="first_name" className={form.first_name ? "active" : ""}>First Name</label>
							          	<span className="helper-text" data-error="Required field" ></span>
								    </div>
								    <div className="input-field col s6">
								       <input id="last_name"
							          	defaultValue={form.last_name}
							          	name="last_name"
							          	onChange={e => this.inputValueChange(e)}
							          	type="text" required className="validate" />
							          	<label htmlFor="last_name" className={form.last_name ? "active" : ""}>Last Name</label>
							          	<span className="helper-text" data-error="Required field" ></span>
								    </div>
							    </div>
							    <div  className="input-field">
							    	<label>User Role</label>
							    	<select defaultValue={form.role} onChange={e => this.inputValueChange(e)} name="role">
								      <option value="" disabled >Choose User Role</option>
								      {roles.map((row, key) => 
										<option value={row.id} key={key}>{row.role}</option>
								      )}
								    </select>
							    </div>
							    <div className="input-field">
							       <input id="password"
						          	defaultValue={form.password}
						          	name="password"
						          	onChange={e => this.inputValueChange(e)}
						          	type="password" required className="validate" />
						          	<label htmlFor="password" className={form.password ? "active" : ""}>Password</label>
						          	<span className="helper-text" data-error="Required field" ></span>
							    </div>
							    <div className="switch">
								    <label>
								      Inactive
								      <input type="checkbox" 
								      name="active"
									  onChange={e => this.inputValueChange(e, !form.active)}
								      defaultChecked={form.active}/>
								      <span className="lever"></span>
								      Active
								    </label>
								</div>
								<div className="input-field">
								<button type="submit"
						        disabled={disableSubmit}
						         className="btn-small waves-effect waves-light btn">
						         <i className="material-icons right">send</i>Save</button>
						         </div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>)
	}
}
export default EditUser;
