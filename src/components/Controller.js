import {Component} from 'react';
import firebase from './Firebase';
import $ from "jquery";
import md5 from 'md5';
class Controller extends Component {
	/*constructor(props){
		super(props);
	}*/
	get_ipaddress = () => {
		return new Promise ((resolve) => {
			$.getJSON("https://api.ipify.org?format=json", 
	            function(data) {
	            resolve(data.ip);
	        });
		});
	}
	token_remove = async () => {
		return new Promise(async (resolve) => {
			var token = localStorage.getItem("token");
			if(token){
				firebase.database().ref('api_tokens/'+token).remove();
				localStorage.removeItem("token");
				resolve(true);
			}
			else{
				resolve(true);
			}
		});
	}
	setDefaultDatabase= async () => {
		var snapshot = await firebase.database().ref('users/').once('value');
		var data = snapshot.val();
		if(!data){
			var id = Date.now();
			var insert_data = {
				username : "admin",
				first_name : "admin",
				last_name : "user",
				password : md5("admin"),
				role : "admin",
				active : true,
				id : id
			}
			firebase.database().ref('users/'+id).set(insert_data);
			var role_data = { "admin" : {
					"active" : true,
					"id" : "admin",
					"role" : "Admin",
				}, 
				"subscriber" : {
					"active" : true,
					"id" : "subscriber",
					"role" : "Subscriber",
				}};
			firebase.database().ref('roles').set(role_data);
		}
	}
	token_validate = async (page = '') => {
		var self = this;
		// self.setDefaultDatabase();
		return new Promise(async (resolve) => {
			var token = localStorage.getItem("token");
			if(token){
				var ip_address = await this.get_ipaddress();
				firebase.database().ref('api_tokens/'+token).once('value').then(function(userSnapshot){
			      const result = userSnapshot.val()
			      if(result && ip_address === result.ip_address){
			      	result.last_access = Date.now();
			      	firebase.database().ref('api_tokens/'+token).set(result);
			      	if(page === 'login'){
						self.props.history.push("/todo");
					}
			      	resolve(result);
			      }
			      else{
			      	localStorage.removeItem('token');
			      	if(page !== 'login'){
						self.props.history.push("/login");
					}
			      	resolve(false);
			      }
			    });
			}
			else{
				if(page !== 'login'){
					self.props.history.push("/login");
				}
				resolve(false);
			}
		});
	}
}
export default Controller;
