import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import M from 'materialize-css';
import { Link, Redirect } from 'react-router-dom';
import SideNavigation from '../includes/SideNavigaton';
var form = {
	name : "",
	status : true,
	id : Date.now()
};
class EditProject extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			disableSubmit : false, 
			form : JSON.parse(JSON.stringify(form)),
			isLoaded   : false,
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
			var snapshot = await db.ref('projects/'+params.id).once('value');
			var data = snapshot.val();
			if(!data){
				this.props.history.push("/404");
			}
			this._isMounted && data && this.setState({form : data});
		}
		this._isMounted && this.setState({isLoaded : true, user : user});
		
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	doSubmit = (event) => {
		event.preventDefault();
		const {form, db} = this.state;
		if(form.name !== ''){
			this.setState({disableSubmit : true});
			db.ref('projects/'+form.id).set(form);
    		M.toast({html: '<span>Projects successfully updated.</span>'});
    		this.props.history.push("/projects");
	    }
	}
	inputValueChange = (e, value = "") => {
		let {form, disableSubmit} = this.state
		form[e.target.name] = value!=="" ? value : e.target.value;
		disableSubmit = true;
		if(form.name){
			disableSubmit = false;
		}
		this.setState({form : form, disableSubmit : disableSubmit});

	}
	render(){
		var {isLoaded, disableSubmit, form, user} = this.state;
		if(!isLoaded || !form){
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
					    <h3 className="white-text">{form.name?"Edit":"Add"} Project</h3>
					</div>
					<form action="" onSubmit={this.doSubmit} method="post">
						<div className="card">
							<div className="go-back left">
								<Link to="/projects"><i className="material-icons right">arrow_back</i></Link>
							</div>
							<div className="inner">
								
							    <div className="input-field">
							       <input id="name"
						          	defaultValue={form.name}
						          	name="name"
						          	onChange={e => this.inputValueChange(e)}
						          	type="text" required className="validate" />
						          	<label htmlFor="name" className={form.name ? "active" : ""}>Project Name</label>
						          	<span className="helper-text" data-error="Required field" ></span>
							    </div>
							    <div className="switch">
								    <label>
								      Inactive
								      <input type="checkbox" 
								      name="status"
									  onChange={e => this.inputValueChange(e, !form.status)}
								      defaultChecked={form.status}/>
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
export default EditProject;
