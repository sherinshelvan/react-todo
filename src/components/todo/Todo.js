import React from 'react';
import Controller from '../Controller';
import firebase from '../Firebase';
import { Link } from 'react-router-dom';
import SideNavigation from '../includes/SideNavigaton';
import M from 'materialize-css';
import $ from 'jquery';
class Todo extends Controller {
	constructor(props){
		super(props);
		this.state = {
			db : firebase.database(),
			isLoaded   : false,
			results : [], 
			users : [],
			projects : [],
			search : {
				task : "",
				res : "",
				project : ""
			},
			undo : ""
		};
		this.doDelete.bind(this);
		this.doFilter.bind(this);
		this._isMounted = false;
	}
	async componentDidMount(){
		var self = this;
		this._isMounted = true;
		const {db} = this.state;
		var user = await this.token_validate();
		await db.ref('todo/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
				if(user.role === 'admin' || String(user.id) === String(results[key]['assigned_to'])){
					temp.push(results[key]);
				}
	    	}
			this._isMounted && this.setState({
				user : user,
				results : temp
			});
		});
		await db.ref('users/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
	        	if(results[key]['active']){
					temp.push(results[key]);
				}
	    	}
			this._isMounted && this.setState({
				users : temp,
				user : user,
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
				projects : temp,
				user : user,
				isLoaded : true, 
			});
			var elems = document.querySelectorAll('select');
    		M.FormSelect.init(elems, {});
		});
		$(document).on("click", "button.toast-action", function(e){			
			if( self._isMounted && self.state.undo){
				var undo = self.state.undo;
				db.ref('todo/'+undo.id).set(undo);
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
		db.ref('todo/'+row.id).remove();
		var toastHTML = '<span class="remove">ToDo successfully removed.</span><button class="btn-flat toast-action">Undo</button>';
  		M.toast({html: toastHTML});
	}
	doFilter = async (key, value) => {
		const {search, db, user} = this.state;
		search[key] = value;
		this._isMounted && this.setState({search : search});
		await db.ref('todo/').on('value', async (snapshot)=>{
			var results = snapshot.val();
			var temp = [];
			for (var key in results) {
				var push_status = true;
				if(user.role !== 'admin' && user.id !== results[key]['assigned_to']){
					push_status = false;					
				}
				if(push_status && search.res && JSON.parse(search.res) !== JSON.parse(results[key]['assigned_to']) ){
					push_status = false;
				}
				if(push_status && search.task !== '' && JSON.parse(search.task) !== results[key]['completed']){
					push_status = false;
				}
				if(push_status && search.project !== '' && JSON.parse(search.project) !== JSON.parse(results[key]['project_id'])){
					push_status = false;
				}
				if(push_status){
					temp.push(results[key]);
				}
	    	}
			this._isMounted && this.setState({
				user : user,
				results : temp
			});
		});
		
	}
	render(){
		const { isLoaded, results, user, users, projects} = this.state;
		if(!isLoaded){
			return null;
		}
		return (<div className="main-wrapper">
			<div className="top-bg gradient-45deg-indigo-purple"></div>
			<SideNavigation user={user} />
			<div id="main-content">
				<div className="container">			
					<div className="page-title">
					    <h3 className="white-text">ToDo List</h3>
					</div>
					<div className="card">
						<div className="todo-filter">
							{user && user.role === 'admin' &&
							<div className="item">
								<label>Search By Responsibility</label>
								<select onChange={e=> this.doFilter('res', e.target.value)}>
									<option value="">All</option>
									{users.map((row, key) => 
										<option key={key} value={row.id}>{row.first_name} {row.last_name}</option>
									)}
								</select>
							</div>
							}
							<div className="item">
								<label>Search By Task Status</label>
								<select onChange={e=> this.doFilter('task', e.target.value)}>
									<option value="">All</option>
									<option value="false">Pending</option>
									<option value="true">Completed</option>
								</select>
							</div>
							<div className="item">
								<label>Search By Project</label>
								<select onChange={e=> this.doFilter('project', e.target.value)}>
									<option value="">All</option>
									{projects.map((row, key) => 
										<option key={key} value={row.id}>{row.name}</option>
									)}
								</select>
							</div>
							<Link to="/todo/add" className="btn-small waves-effect waves-light btn" title="Add New"><i className="material-icons">add</i></Link>
						</div>
					    <table>
					        <thead>
					            <tr>
					                <th >Name</th>
					                <th>Responsibility</th>
					                <th>Task</th>
					                <th>Project</th>
					                <th>Status</th>
					                <th>Actions</th>
					            </tr>
					        </thead>
					        <tbody>
					        	{results.map((row, key) => 
									<tr key={key}>
										<td>{row.title}</td>
										<td>{row.assigned_user}</td>
										<td>{row.completed_task}/{row.total_task}</td>
										<td>{row.project_name}</td>
										<td>{row.active? "Active" : "Inactive"}</td>
										<td>
											<Link to={"/todo/details/"+row.id} title="Details">
											<i className="material-icons">zoom_in</i></Link>
											<Link to={"/todo/edit/"+row.id} title="Edit">
											<i className="material-icons">edit</i></Link>
											<Link to="#" onClick={e => this.doDelete(row)} title="Delete">
											<i className="material-icons">delete</i></Link>
										</td>
									</tr>
								)} 
								{results.length === 0 &&
									<tr>
										<td colSpan="6">No results found.</td>
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
export default Todo;
