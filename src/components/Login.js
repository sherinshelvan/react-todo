import React from 'react';
import Controller from './Controller';
import firebase from './Firebase';
import M from 'materialize-css';
import md5 from 'md5';
class Login extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			form : {
				username   : "",
				password   : "",
			},
			isLoaded   : false,
			disableSubmit : true
		};
		this._isMounted = false;
		this.doLogin.bind(this);
		this.inputValueChange.bind(this);
	}
	async componentDidMount(){
		this._isMounted = true;
		await this.token_validate('login');
		this._isMounted && this.setState({isLoaded : true});
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	inputValueChange = (e) => {
		let {form, disableSubmit} = this.state
		form[e.target.name] = e.target.value;
		disableSubmit = true;
		if(form.username && form.password){
			disableSubmit = false;
		}
		this.setState({form : form, disableSubmit : disableSubmit});

	}
	doLogin = async (event) => {
		this.setState({disableSubmit : true});
		event.preventDefault();
		const {db, form} = this.state;
		var login_status = false;		
		db.ref('users').on('value', async (snapshot)=>{
	      var results = snapshot.val();
	      for (var key in results) {
	        var row = results[key];
	        if(row.username === form.username && row.password === md5(form.password)){
	        	if(row.active){
	        		var ip_address = await this.get_ipaddress(); 
	        		var token = md5(Date.now());
	        		db.ref('api_tokens/'+token).set({
	        			token : token,
	        			ip_address : ip_address,
	        			id  : row.id,
	        			role  : row.role,
	        			name : row.first_name+" "+row.last_name,
	        			token_create : Date.now(),
	        			last_access : Date.now(),
	        		});
	        		M.toast({html: '<span>Hi '+row.first_name+" "+row.last_name+', Welcome</span>'})
	        		localStorage.setItem("token", token);
	        		login_status = true;
	        		this.props.history.push("/todo");
	        	}
	        	else{
	        		M.toast({html: '<span>Your account has been deactivated. Please contact your site administrator.</span>'});
	        		this.setState({disableSubmit : false});
	        	}
	        }
	      } 
	      if(!login_status){
	      	M.toast({html: '<span>Invalid Username or Password.</span>'});
	      	this.setState({disableSubmit : false});
	      }
	    });
	}
	render(){
		const {form, isLoaded, disableSubmit} = this.state;
		if(isLoaded){
			return (<div className="login-wrapper">
				<form action="" onSubmit={this.doLogin} method="post">
					<div className="top-bg gradient-45deg-indigo-purple"></div>
					<div className="login-form">
					    <div className="card">
					        <h3>Login</h3>
					        <div className="input-field">
					            <input id="username" type="text" 
					          	value={form.username}
					          	name="username"
					          	onChange={this.inputValueChange}
					          	required className="validate" />
					          	<label htmlFor="username">Username</label>
					          	<span className="helper-text" data-error="Required field" ></span>
					        </div>
					        <div className="input-field">
					            <input id="password" type="password" 
					          	value={form.password}
					          	name="password"
					          	onChange={this.inputValueChange}
					          	required className="validate" />
					          	<label htmlFor="password">Password</label>
					          	<span className="helper-text" data-error="Required field" ></span>
					        </div>
					        <button className="btn waves-effect waves-light"
					         type="submit" disabled={disableSubmit} name="action">Login
					        <i className="material-icons right">send</i>
					        </button>
					    </div>
					</div>
		        </form>
			</div>)
		}
		else{
			return <div>Loading</div>
		}
	}
}
export default Login;
