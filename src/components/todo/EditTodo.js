import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import M from 'materialize-css';
import { Link } from 'react-router-dom';
import SideNavigation from '../includes/SideNavigaton';
var form = {
	title : "",
	description : "",
	project_id : "",
	project_name : "",
	assigned_to : "",
	assigned_user : "",
	active : true,
	task : [],
	id : Date.now(),
	total_task : 0,
	completed_task : 0
};
class EditTodo extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			disableSubmit : true, 
			form : JSON.parse(JSON.stringify(form)),
			add_task : "",
			isLoaded   : false,
			users : [],
			projects : []
		};
		this.doSubmit.bind(this);
		this.addTask.bind(this);
		this._isMounted = false;
		this.inputValueChange.bind(this);
		this.removeTaskItem.bind(this);
		this.taskValueChange.bind(this);
		this.checkItemChange.bind(this);
	}
	async componentDidMount(){
		this._isMounted = true;
		const {match : {params}} = this.props;
		const {db, form} = this.state;
		form.id = Date.now();
		this._isMounted && this.setState({form : form});
		var user = await this.token_validate();
		if(params && params.id){
			var snapshot = await db.ref('todo/'+params.id).once('value');
			var data = snapshot.val();
			if(!data || (data && user.role !== 'admin' && String(user.id) !== String(data['assigned_to']))){
				this._isMounted = false;
				this.props.history.push("/access-denied");
			}
			this._isMounted && data && this.setState({disableSubmit : false, form : JSON.parse(JSON.stringify(data))});
		}
		await db.ref('users/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
	        	if(results[key]['active']){
					temp.push(results[key]);
				}
	    	}
			this._isMounted && this.setState({
				users : temp
			});
		});
		await db.ref('projects/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
				if(results[key]['status']){
					temp.push(results[key]);
				}
	    	}
			this._isMounted && this.setState({
				isLoaded : true, 
				user : user,
				projects : temp
			});
			var elems = document.querySelectorAll('select');
    		M.FormSelect.init(elems, {});
		});
		
		
	}
	componentWillUnmount = () => {
	    this._isMounted = false;
	};
	addTask = async () => {
		let {add_task, form} = this.state;
		if(add_task){
			form.task = form.task && form.task.length ? form.task : [];
			form.task.push({id : Date.now(), title : add_task, status : false});
			this._isMounted && this.setState({form : form, add_task : ""});
		}
		
	}
	taskValueChange = (e) => {
		this._isMounted && this.setState({add_task : e.target.value});
		if(e.target.value && e.key === 'Enter'){
			this.addTask();
		}
		
	}
	checkItemChange = (id, status) => {
		const {form} = this.state;
		form.task[id]['status'] = status;
		this._isMounted && this.setState({form : form});
	}
	removeTaskItem = (id) => {
		let {form} = this.state;
		form.task.splice(id, 1);
		this._isMounted && this.setState({form : form});
	}
	doSubmit = async (event) => {
		event.preventDefault();
		const {form, db, disableSubmit, user} = this.state;
		if(!disableSubmit){
			this.setState({disableSubmit : true});
			var snapshot = await db.ref('projects/'+form.project_id).once('value');
			var project_data = snapshot.val();
			if(project_data && project_data !== null){
				form.project_name = project_data.name;
			}
			form.assigned_to = user.role === 'admin' ? form.assigned_to : user.id;
			var user_snapshot = await db.ref('users/'+form.assigned_to).once('value');
			var assigned_user = user_snapshot.val();
			form.assigned_user = assigned_user.first_name+" "+assigned_user.last_name;
			form.total_task = 0;
			form.completed_task = 0;
			if(form.task){
				form.total_task = form.task.length;
				var inc = 0;
				form.task.forEach(function(element, index){
					if(element.status){
						inc++;
					}
				});
				form.completed_task = inc;
			}
			form.completed = form.total_task === form.completed_task ? true : false;
			db.ref('todo/'+form.id).set(form);
    		M.toast({html: '<span>Todo successfully updated.</span>'});
    		this.props.history.push("/todo");
	    }
	}
	inputValueChange = (e, value = "") => {
		let {form, disableSubmit, user} = this.state
		form[e.target.name] = value!=="" ? value : e.target.value;
		disableSubmit = true;
		if(form.title && form.project_id){			
			disableSubmit = false;
			if(user.role === 'admin' && !form.assigned_to){
				disableSubmit = true;
			}
		}
		this.setState({form : form, disableSubmit : disableSubmit});
	}
	render(){
		var {isLoaded, disableSubmit, form, user, users, projects} = this.state;
		if(!isLoaded){
			return null;
		}
		return (<div className="main-wrapper">			
			<div className="top-bg gradient-45deg-indigo-purple"></div>
			<SideNavigation user={user} />
			<div id="main-content">
				<div className="container">			
					<div className="page-title">
					    <h3 className="white-text">{form.title?"Edit":"Add"} ToDo</h3>
					</div>
					
					<div className="card">
						<div className="inner">
							<div className="row">
								<div className="col s6">
									<form action="" id="todo_edit" onSubmit={this.doSubmit} method="post">
										<div className="input-field">
									       <input id="title"
								          	defaultValue={form.title}
								          	name="title"
								          	onChange={e => this.inputValueChange(e)}
								          	type="text" required className="validate" />
								          	<label htmlFor="title" className={form.title ? "active" : ""}>Title</label>
								          	<span className="helper-text" data-error="Required field" ></span>
									    </div>
									    <div className="input-field">
									    	<label>Project</label>
									    	<select required defaultValue={form.project_id} onChange={e => this.inputValueChange(e)} name="project_id">
										      <option value="" disabled >Choose Project</option>
										      {projects.map((row, key) => 
												<option value={row.id} key={key}>{row.name}</option>
										      )}
										    </select>
										</div>
										{user && user.role === 'admin' &&
											<div className="input-field">
										    	<label>Assign To</label>
										    	<select required defaultValue={form.assigned_to} onChange={e => this.inputValueChange(e)} name="assigned_to">
											      <option value="" disabled >Choose User</option>
											      {users.map((row, key) => 
													<option value={row.id} key={key}>{row.first_name} {row.last_name}</option>
											      )}
											    </select>
											</div>
										}
									    <div className="input-field">
								            <textarea required id="description" 
								            name="description"
								            value={form.description}
											onChange={e => this.inputValueChange(e)}
								            className="materialize-textarea" ></textarea>
								            <label htmlFor="description">Description</label>
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
									</form>
								</div>
								<div className="col s6">									
									<h4>Tasks</h4>
									<div className="input-field add-new-todo">
								       <input 
								       name="add_task"
								        value={this.state.add_task}
							          	onKeyUp={e => this.taskValueChange(e) }
							          	onChange={e => this.setState({add_task : e.target.value}) }
							          	type="text" />
							          	<Link onClick={this.addTask} className="waves-effect waves-light btn-small red" to="#">Add</Link>
							        </div>
							        <div className="task-list">
							        	{form.task && form.task.map((row, key) => 
											<p key={key}><label>
										        <input defaultChecked={row.status} 
										        onChange={e=> this.checkItemChange(key, !row.status)}
										        type="checkbox" />
										        <span>{row.title}</span>
										    	</label>
										    <span onClick={e => this.removeTaskItem(key)} className="close"> <i className="material-icons">close</i></span>
										    </p>
										)}
							        	
							        </div>
								</div>
							
								<div className="col s12 input-field">
									<button type="submit" form="todo_edit"
							        disabled={disableSubmit}
							         className="btn-small waves-effect waves-light btn">
							         <i className="material-icons right">send</i>Save</button>
						        </div>
					        </div>
						</div>
					</div>
				</div>
			</div>
		</div>)
	}
}
export default EditTodo;
