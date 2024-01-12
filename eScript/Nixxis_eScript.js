/*******************************************************************************************************
	E-Script Intergration Script
	
	Description: 	This script is designed to integrate Nixxis Contact Suite 2.4.x/3.x with Seeasoftware's E-Script script editor
	Dependencies: 	NixxisClientScript.js
	Author: 		Nixxis Indian Ocean
	Version: 		v2.2f (ThinClient)
	Last Update: 	2023-09-28

	
******************************************************************************************************
	
	Functions:
		NixxisScript.Voice.NewVoiceCall(destination, hasOriginator, originator)
		NixxisScript.Voice.Hangup(destination)
		NixxisScript.Voice.Hold()
		NixxisScript.Voice.TransferForward(isForward,destination)
		NixxisScript.Voice.Redial(destination)
		NixxisScript.Voice.SendDTMF(DTMF)
		NixxisScript.Voice.StartRecording()
		NixxisScript.Voice.StopRecording()

		NixxisScript.Qualifications.GetQualification(hasActivityId,activityId,allQualification,isPositive,isNeutral,isNegative,isArgued,isCallback)
		NixxisScript.Qualifications.SetQualification(qualification,callbackDate,callbackTime,callbackPhone,isCallback)

		NixxisScript.Common.NixxisInit()
		NixxisScript.Common.CreateRecord(hasActivityId,activityId)
		NixxisScript.Common.SetInternalId()
		NixxisScript.Common.CloseScript()
		NixxisScript.Common.CloseScriptGoReady()
		
	
******************************************************************************************************	
	eScript Variable References: 
		* Get global variable from script -  _Act_Manager.Prepare.getGlobal('Variable Name') ;
		* Modify a script variable, MyVar with MyValue -  _Act_Manager.Prepare.setGlobal('MyVar', 'MyValue'); 
		* Create a new script variable -  _Pr._S.GlbVar['MyNewVar'] = { value: 'MyNewValue', type: 'String' };  // type = String, Array or Object
		* Check if a script variable exists -  if ( _Pr._S.GlbVar['ThisVarExist'] ) // True if exists
		* Notes: To prevent from breaking the script flow use prefix 'NixxisVar_' creating new variables.

******************************************************************************************************/
//For retro compatility
//var NixxisDirectLink = true;

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var KEY_PLUGIN_TC = urlParams.get('KEY_PLUGIN');
var AgentId_TC = urlParams.get('AgentId');
var From_TC = urlParams.get('CtFrom');
var To_TC = urlParams.get('CtTo');
var ActivityId_TC = urlParams.get('ActivityId');
var SessionId_TC = urlParams.get('SessionId');
var ContactId_TC = urlParams.get('ContactId'); 
//

var NixxisDirectLink =
{
    serviceUrl: "https://shrikant.nixxis.com/agent",
    sessionId: SessionId_TC,
    contactId: ContactId_TC,
	ActivityId: ActivityId_TC,
	AgentId: AgentId_TC,
	CtFrom: From_TC,
	CtTo: To_TC,
	ContactListId: KEY_PLUGIN_TC,
    linkMode: "image",
    __version: "9",
    __linkImage: new Array(new Image(), new Image(), new Image(), new Image(), new Image()),
    __linkImageIndex: 0,
    __sequence: (new Date().getTime()),
    __newRequest: new Function((window.XMLHttpRequest) ? 'return new XMLHttpRequest();' : 'return new ActiveXObject("Msxml2.XMLHTTP");'),
    __execute: function (commandCode, parameters) {
        var data = '', response = null;
        var hostSep, fullUrl,fullUrl2;

        hostSep = NixxisDirectLink.serviceUrl.indexOf('/', 9);

        if (NixxisDirectLink.linkMode == "image") {
            for (var i = 1; i < arguments.length; i++) {
                if (arguments[i])
                    data += '&__p' + i.toString() + '=' + escape(arguments[i].toString());
            }

			NixxisDirectLink.__linkImage[NixxisDirectLink.__linkImageIndex].src = NixxisDirectLink.serviceUrl + '?action=' + commandCode.toString() + '&inc=' + (++NixxisDirectLink.__sequence).toString() + data;
            if (++NixxisDirectLink.__linkImageIndex >= NixxisDirectLink.__linkImage.length)
                NixxisDirectLink.__linkImageIndex = 0;
        }
        else {
            for (var i = 1; i < arguments.length; i++) {
                if (arguments[i])
                    data += escape(arguments[i].toString()) + '\n';
            }
            var link = NixxisDirectLink.__newRequest();

            for (var retry = 0; retry < 3; retry++) {
                try {
                    if (NixxisDirectLink.serviceUrl == '') {
                        var location = document.location.href;
                        var i, ix = -1;

                        for (i = 0; i < 4 && (ix = location.indexOf('/', ++ix)) >= 0; i++);

                        if (ix < 0) ix = location.indexOf('?');
                        if (ix < 0) ix = location.length;

                        NixxisDirectLink.serviceUrl = location.substr(0, ix);
                    }

                    link.open('POST', fullUrl + '?events=no&fmt=uri&action=' + commandCode.toString(), false);
					//link.open('POST', fullUrl2 + '?events=no&fmt=uri&action=' + commandCode.toString(), false);
                    link.send(data);

                    response = link.responseText;
                    break;
                }
                catch (e) {
                    try {
                        link.abort();
                    }
                    catch (e2) {
                        ;
                    }
                }
            }

            try {
                link.abort();
            }
            catch (e3) {
                ;
            }

            link = null;
        }

        return response;
    },
    setQualification: function (qualificationId) {
        if (arguments.length > 1) {
            NixxisDirectLink.__execute('~setinfo', '1', (NixxisDirectLink.contactId) ? NixxisDirectLink.contactId : '*', qualificationId, arguments[1], (arguments.length > 2) ? arguments[2] : "", (arguments.length > 3) ? arguments[3] : "");
        }
        else {
            NixxisDirectLink.__execute('~setinfo', '1', (NixxisDirectLink.contactId) ? NixxisDirectLink.contactId : '*', qualificationId);
        }
    },
    setInternalId: function (internalId) {
            NixxisDirectLink.__execute('~setinfo', '5', NixxisDirectLink.contactId, "@@ContactListId", internalId);
    },
    nextContact: function () {
        NixxisDirectLink.__execute('10', NixxisDirectLink.contactId);
    },
    startRecording: function () {
        NixxisDirectLink.__execute('19', 'True', NixxisDirectLink.contactId);
    },
    stopRecording: function () {
        NixxisDirectLink.__execute('19', 'False', NixxisDirectLink.contactId);
    },
    voiceNewCall: function (destination, originator) {
        if (typeof (originator) == "undefined")
            NixxisDirectLink.__execute('14', destination);
        else
            NixxisDirectLink.__execute('14', destination, 'Orig=' + originator);
    },
    voiceAdvancedCall: function (destination, originator, activityId, customerid, contactListId, onbehalf) {
            NixxisDirectLink.__execute('14', destination, 'Orig=' + originator, 'AcId=' + activityId, 'CuId=' + customerid, 'LsId=' + contactListId, 'OnBehalf=' + onbehalf);
    },
    voiceConference: function () {
        NixxisDirectLink.__execute('18');
    },
    voiceRetrieve: function () {
        NixxisDirectLink.__execute('12');
    },
    voiceTransfer: function () {
        NixxisDirectLink.__execute('voicetransfer');
    },
    voiceForward: function (destination) {
        NixxisDirectLink.__execute('voiceforward', destination);
    },

    sendDtmf: function (dtmf) {
        NixxisDirectLink.__execute('~senddtmf', dtmf);
    }
};

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var KEY_PLUGIN_TC = urlParams.get('KEY_PLUGIN');
var AgentId_TC = urlParams.get('AgentId');
var From_TC = urlParams.get('CtFrom');
var To_TC = urlParams.get('CtTo');
var ActivityId_TC = urlParams.get('ActivityId');
var SessionId_TC = urlParams.get('SessionId');
var ContactId_TC = urlParams.get('ContactId'); 

var NixxisScript = {

	KEY_PLUGIN: null,
	appURI: "shrikant.nixxis.com",
	dataURI: "https://shrikant.nixxis.com/data",
	host: "shrikant.nixxis.com",
	
    contactId: NixxisDirectLink.contactId,
	ActivityId: NixxisDirectLink.ActivityId,
	AgentId: NixxisDirectLink.AgentId,
	CtFrom: NixxisDirectLink.CtFrom,
	CtTo: NixxisDirectLink.CtTo,
	ContactListId: KEY_PLUGIN_TC,

	LastError: null,

	//VoiceControls
	Voice: {

		/**
		 * 	New Call
		 *	@params	:	string	destination			The phonenumber/destination to call
						bool	hasOriginator		Choice to use custom originator
						string	originator			Number to be used as originator for the call
		 *	@return	:	bool						False for Error			
		**/
		NewVoiceCall: function (destination, hasOriginator, originator) {
			if (destination == '') {
				return false;
			} else if (hasOriginator && originator != '') {
				NixxisDirectLink.voiceNewCall(destination, originator);
				return true;
			} else {
				NixxisDirectLink.voiceNewCall(destination);
				return true;
			}

		},


		/**
		 * 	Redial
		 *	@params	:	string	destination			The phonenumber/destination to call
		 *			
		**/
		Redial: /** boolean */ function (destination) {

			try {

				//this will call the m_CInfo.Redial function

				/*window.external.redial(

					destination,

					window.external.ContactListId,

					window.external.Activity);*/
				NixxisDirectLink.voiceNewCall(destination);



				//window.external.redial(destination);//this does nothing

				return true;

			} catch (e) {

				this.LastError = "Redial : " + e;

				return false;

			}

		},


		/**
		 * 	Hangup
		 *	@params	:	string	destination			The phonenumber/destination to hangup
		 *			
		**/
		Hangup : function() {

			try {
	  
			  //window.external.voicehangup();
	  
			} catch(e) {
	  
			  this.LastError = "Hold : " + e;
	  
			}
	  
		  },


		/**
		 * 	Hold
		 *			
		**/
		Hold : function() {

			try {
	  
			  //window.external.voicehold();
	  
			} catch(e) { 
	  
			  this.LastError = "Hold : " + e; 
	  
			}
	  
		  },


		/**
		 * 	Transfer or Forward the call
		 *	@params	:	bool	isForward			Choice to use custom originator
						string	destination			The phonenumber/destination to forward the call
		*	@return	:	bool						False for Error			
		**/
		TransferForward : /** boolean */ function(isForward, destination) {

			try {
	  
			  if(!isForward) {
	  
				NixxisDirectLink.voiceTransfer();
	  
				return true;
	  
			  }
	  
			  else {

				NixxisDirectLink.voiceForward();
	  
				return true;
	  
			  }				
	  
			} catch(e) {
	  
			  this.LastError = "TransferForward : " + e;
	  
			  return false;
	  
			}
	  
		  },


		/**
		 * 	Send DTMF
		 *	@params	:	string	DTMF			The dtmf number to transmit
		 *			
		**/
		SendDTMF : function(DTMF) {

			try {

			  NixxisDirectLink.sendDtmf(DTMF);
	  
			} catch(e) {
	  
			  this.LastError = "SendDTMF : " + e;
	  
			}
	  
		  },


		/**
		 * 	Start Recording
		 *			
		**/
		StartRecording : function() {

			try {
	  
			  NixxisDirectLink.startRecording();
	  
			} catch(e) {
	  
			  this.LastError = "StartRecording : " + e;
	  
			}
	  
		  },


		/**
		 * 	Stop Recording 
		 *			
		**/
		StopRecording : function() {

			try {
	  
			  NixxisDirectLink.stopRecording();
	  
			} catch(e) {
	  
			  this.LastError = "StopRecording : " + e;
	  
			}
	  
		  }	 

	},

	//Qualifications
	Qualifications : {

		/**
	
		 * Get Qualification
	
		 * @param {boolean} hasActivityId : Choice to provide activityId
	
		 *     for the list of qualifications or load qualifications for 
	
		 *     the current activity -> this parameter should be removed.
	
		 * @param {string} activityId : The GUID of the activity
	
		 *     for the list of qualifications
	
		 * @param {boolean} allQualification : Display all qualifications
	
		 * @param {boolean} isPositive : Display positive qualifications
	
		 * @param {boolean} isNeutral : Display Neutral qualifications
	
		 * @param {boolean} isNegative : Display Negative qualifications
	
		 * @param {boolean} isArgued : Display Argued qualifications
	
		 * @param {boolean} isCallback : Display Callback qualifications
	
		 * @return {string} : Qualifications list formatted in Json with fields :
	
		 *   QualificationId
	
		 *   Description
	
		 *   Action (enum string)
	
		 *   Argued (enum string)
	
		 *   Value
	
		 */
	
		GetQualification : function (
	
			hasActivityId,
	
			activityId,
	
			allQualification,
	
			isPositive,
	
			isNeutral,
	
			isNegative,
	
			isArgued,
	
			/** we are missing includeNotArgued param here */
	
			isCallback) {
	
		  /**
	
		   * window.external.GetQualifications(
	
		   *    bool includePositive,
	
		   *    bool includeNegative,
	
		   *    bool includeNeutral,
	
		   *    bool includeArgued,
	
		   *    bool includeNotArgued)
	
		   * returns a string containing the list of qualifications
	
		   * (without the nodes) in the form :
	
		   * GUID;Description;Action;Argued;Value;0
	
		   * Where :
	
		   * GUID = id of the qualification 
	
		   * Description = Description
	
		   * Action = see EnumQualificationActions:
	
		   *  Id	Description
	
		   *  0 None
	
		   *  1 Do not retry
	
		   *  2 Retry at
	
		   *  3 Retry not before
	
		   *  4 Callback
	
		   *  5 Targeted callback
	
		   *  6 Activity change
	
		   *  7 Black list
	
		   * Argued : boolean
	
		   * Value :
	
		   *  1 Positive
	
		   *  0 Neutral
	
		   *  -1 Negative
	
		   * 0 : end line delimiter
	
		   *
	
		   * This one returns the nodes and qualifs ... not used here.	
	
		   * window.external.executeCommand(
	
		   *    '~getinfo',
	
		   *    1,
	
		   *    "ef7e3357b7a44240a9538b670cd30598");
	
		   */
	
	
	
		  /**
	
		   * Types of Action.
	
		   * @enum {integer}
	
		   */
	
		  const Actions = {
	
			0: 'None',
	
			1: 'Do not retry',
	
			2: 'Retry at',
	
			3: 'Retry not before',
	
			4: 'Callback',
	
			5: 'Targeted callback',
	
			6: 'Activity change',
	
			7: 'Black list'
	
		  };
	
	
	
		  /**
	
		   * Types of Argued.
	
		   * @enum {string}
	
		   */
		  
		  // v2.2f - Correction : 	Values are bypassed because if custom value is used text is not displayed
		  // 						Int will be displayed instead
		  /*
		  const Values = {
	
			'-1': 'Negative',
	
			'0': 'Neutral',
	
			'1': 'Positive'
	
		  };
		  */
	
	
	
		  try {
	
			let includePositive = includeNegative = includeNeutral =
	
				includeArgued = includeNotArgued = false;
	
	
			// v2.2f - Correction 	: Added includeArgued if isPositive, isNeutral, isNegative

			// v2.2f - Known issues :
			// 							isArgued must not be used
			// 							isCallback is to be used alone

			if (isPositive) includePositive = includeArgued = true;
	
			if (isNeutral) includeNeutral = includeArgued = true;
	
			if (isNegative) includeNegative = includeArgued = true;
	
			if (isArgued) includeArgued = true;
	
			if (allQualification) {
	
			  includePositive = includeNegative = includeNeutral =
	
				  includeArgued = includeNotArgued = true;
	
			}
	
			// We don't have an input parameter for this ...
	
			// We take everything and it will be filtered in the end.
	
			if (!allQualification && isCallback) {
	
			  includePositive = includeNegative = includeNeutral =
	
				  includeArgued = includeNotArgued = true;
	
			}
	
	
	
			let s = '';
	
			//s = window.external.GetQualifications(
	
				//includePositive,
	
				//includeNegative,
	
				//includeNeutral,
	
				//includeArgued,
	
				//true);
			
			
			// TEST 20230927 contextdata get qualification
			var activityId_;
			
			var baseUri = NixxisScript.dataURI;
			
			activityId_ = NixxisScript.ActivityId;
			
			var uri = "" + baseUri + "?action=GetQualifications&activity=" + activityId_ + "";
			
			console.log(uri);
				
			// Make an AJAX request using the Fetch API
			fetch(uri)
			.then(response => {
				if (!response.ok) {
				throw new Error('Network response was not ok');
				}
				return response.text(); // Get the response body as text
			})
			.then(xmlText => {
				// Parse the XML string into an XML Document
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

				// Now, xmlDoc contains your XML data, and you can work with it as needed
				console.log(xmlDoc);

				// You can save it to a variable if you want
				s = xmlDoc;
    
				// Use xmlData for further processing
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});

	
	
	
			//s = window.external.GetQualifications(true,false,false,false,true);
	
			if(s == "") {
	
			  return "No Qualifications";
	
			}
	
			else {
	
			  //return s;
	
			  let quals = [];
	
			  let temp = s.split(';');
	
			  let n = 0;
	
			  if (temp.length > 0) {
	
				n = (temp.length-1) / 6; //-1 :last item is the end delimiter ;0
				
				// v2.2f - Correction : When n > 5 the last qualification was not visible
				if(n > 5){
					n = n + 1;
				};
	
				for (let i=0; i<=n ;i++) {
	
				  let j=i*5;
	
				  if (i==0) {
	
					quals[i] = { 
	
					  'QualificationId': temp[j],
	
					  'Description': unescape(temp[j+1]),
	
					  'Action': Actions[temp[j+2]],
	
					  'Argued': temp[j+3],
					  // v2.2f - Correction : Was 'Value': Values[temp[j+4]]
					  'Value': temp[j+4]
	
					};
	
				  }
	
				  else {
	
					//There is a carriage return somehow right after the ;0 end
	
					//delimiter -> replace.substring on the QualificationId
	
					quals[i] = {
	
					  'QualificationId': temp[j].replace(/[\n\r]+/g, '')
	
						  .substr(1, temp[j].length),
	
					  'Description': unescape(temp[j+1]),
	
					  'Action': Actions[temp[j+2]],
	
					  'Argued': temp[j+3],

					  // v2.2f - Correction : Was 'Value': Values[temp[j+4]]
					  'Value': temp[j+4]
	
					};
	
				  }
	
				}
	
			  }
	
	
	
			  //Filtering for isCallback option					
	
			  if (allQualification) {
	
				return quals;
	
			  }
	
			  else {
	
				if (isCallback) {
	
				  let filteredQuals = [];
	
				  for (let i=0; i < quals.length ; i++) {
	
					if (quals[i].Action == Actions["4"] || quals[i].Action == Actions["5"]) {
	
					  filteredQuals.push(quals[i]);
	
					}
	
				  }
	
				  return filteredQuals;
	
				}
	
				else {
	
				  let filteredQuals = [];
	
				  for (let i=0; i < quals.length ; i++) {
	
					if (quals[i].Action != Actions["4"] || quals[i].Action != Actions["5"]) {
	
					  filteredQuals.push(quals[i]);
	
					}
	
				  }
	
				  return filteredQuals;
	
				}
	
			  }
	
			}
	
		  }	catch(e) {
	
			this.LastError = "GetQualification : " + e;
	
		  }
	
		},
	
	
	
		/**
	
		 * Set Qualification
	
		 * @param {string} qualificationId : The GUID or the short code or
	
		 *    the custom value of the qualification.
	
		 * @param {string} callbackDate : The date output from a calendar object.
	
		 * @param {string} callbackTime : The time output from a time object.
	
		 * @param {string} callbackPhone : The phonenumber / 
	
		 *    destination of the record.
	
		 * @param {boolean} isCallback : Determines if the qualification is a 
	
		 *    normal qualification or a callback.
	
		 * @return {boolean} : True for qualification executed and False for Error.
	
		 */
	
		SetQualification : function (
	
			qualification,
	
			callbackDate,
	
			callbackTime,
	
			callbackPhone,
	
			isCallback) 
			
			{

				if (callbackPhone == '' || typeof (callbackPhone) == 'undefined' || callbackPhone == 'undefined') {

					try 
					
					{

						//const direction = window.external.GetSessionValue('@Direction');
						const direction = 'O';

						if (direction == 'I') 
						
						{

							callbackPhone = NixxisScript.CtFrom;

						}

						else 
						
						{

							callbackPhone = NixxisScript.CtTo;

						}

					} 
					
					catch (e) 
					
					{

						this.LastError = "SetQualification : " + e;

						return false;

					}

				};


				if ( qualification == "" || isCallback == true && (callbackDate == "" || callbackTime == "" ) ) 
				{

					alert('qualificationId : ' + qualification + '\n' +
					'isCallback : ' + isCallback + '\n' +
					'callbackDate : ' + callbackDate + '\n' +
					'callbackTime : ' + callbackTime + '\n' +
					'callbackPhone : ' + callbackPhone + '\n');

					return false;
			
				};


				if (isCallback == true)
				
				{

					let DateCallback = callbackDate;
	
					let TimeCallback = callbackTime;
	
					let yyyy,MM,dd,HH,mm,DateTime;


					if (DateCallback == '' || TimeCallback == '') {

						alert('qualificationId : ' + qualification + '\n' +
								'isCallback : ' + isCallback + '\n' +
								'callbackDate : ' + callbackDate + '\n' +
								'callbackTime : ' + callbackTime + '\n' +
								'callbackPhone : ' + callbackPhone + '\n'
							);
	
						return false;
			  
					}

					else
					
					{
			  
						//Get DateTime Info
			  
						DateCallback = new Date(DateCallback);
			  
						yyyy = DateCallback.getFullYear();
			  
						MM = DateCallback.getMonth()+1;
			  
						dd = DateCallback.getDate();
			  
						TimeCallback = TimeCallback.split(':');
			  
						HH = TimeCallback[0];
			  
						mm = TimeCallback[1];
			  
			  
						//Convert to string
			  
						yyyy = yyyy.toString();
			  
						MM = MM.toString();
			  
						dd = dd.toString();
			  
						HH = HH.toString();
			  
						mm = mm.toString();

						//checking length
			  
						if (dd.length == '1') dd = '0' + dd;
			  
						if (MM.length == '1') {
			  
						  MM = '0' + MM;
			  
						}

						DateTime = yyyy + MM + dd + HH + mm;

						//window.external.SetQualification(qualification, DateTime, callbackPhone );
						NixxisDirectLink.setQualification(qualification, DateTime, callbackPhone);

					}

				}

				else

				{
					
					//window.external.SetQualification(qualification, "", callbackPhone);
					NixxisDirectLink.setQualification(qualification);

				};
 
		  return true;
	
		}
	
	  },



	//General Commands
	Common: {

		/**
		 * 	Nixxis Init - Initialises NixxisContactLink and basic information, Determines if there is a record linked to the contact.
		 *	@return	:	bool	True for KEY_PLUGIN/ContactListId found and False for KEY_PLUGIN/ContactListId not found 	
		**/
		NixxisInit: function () {
			

			NixxisScript.KEY_PLUGIN = _Act_Manager.Prepare.getGlobal('KEY_PLUGIN');
			/*NixxisScript.dataURI = _Act_Manager.Prepare.getGlobal('NixxisDataURI');
			NixxisScript.appURI = _Act_Manager.Prepare.getGlobal('NixxisApp');
			NixxisScript.host = _Act_Manager.Prepare.getGlobal('NixxisHost');*/


			/*NixxisContactLink.Init();
			var AgentName = NixxisContactLink.agent.UserAccount();
			_Pr._S.GlbVar['NixxisVar_AgentName'] = { value: AgentName, type: 'String' };*/

			try {
				if ((NixxisScript.dataURI == '' || typeof (NixxisScript.dataURI) == 'undefined' || NixxisScript.dataURI == 'undefined') && (NixxisScript.host == '' || typeof (NixxisScript.host) == 'undefined' || NixxisScript.host == 'undefined') && (NixxisScript.appURI == '' || typeof (NixxisScript.appURI) == 'undefined' || NixxisScript.appURI == 'undefined')) throw "Missing App Server Address";
			}
			catch (e) { return "Error : " + e; }

			if ((NixxisScript.dataURI == '' || typeof (NixxisScript.dataURI) == 'undefined' || NixxisScript.dataURI == 'undefined') && !(NixxisScript.appURI == '' || typeof (NixxisScript.appURI) == 'undefined' || NixxisScript.appURI == 'undefined')) {
				NixxisScript.dataURI = 'https:\\' + NixxisScript.appURI + '\data';
			}

			var ContactListId = NixxisScript.ContactListId;
			if (((ContactListId == '' || typeof (ContactListId) == 'undefined' || ContactListId == 'undefined') && (NixxisScript.KEY_PLUGIN == '' || typeof (NixxisScript.KEY_PLUGIN) == 'undefined' || NixxisScript.KEY_PLUGIN == 'undefined'))) { return false; }
			else { return true; }

		},


		/**
		 * 	Create New Record
		 *	@params	:	bool	hasActivityId		Choice to provide activityId into which the new record will be created
						Guid	activityId			The GUID of the activity
		 *	@return	:	bool						True for executed properly and False for Error			
		**/
		CreateRecord: function (hasActivityId, activityId) {

			var contactRef, activityId_;

			var baseUri = NixxisScript.dataURI;

			if (!hasActivityId)
			{ 
				activityId_ = NixxisScript.ActivityId; 
			};

			if (hasActivityId && (activityId != '' || typeof (activityId) != 'undefined' || activityId != 'undefined'))
			{
				activityId_ = activityId;
			};

			if ((activityId_ != '' || typeof (activityId_) != 'undefined' || activityId_ != 'undefined')) 
			{
				var uri = "" + baseUri + "?action=createContextData&activity=" + activityId_ + "";
				//alert(uri);
				$.ajax({
					type: "GET",
					dataType: "xml",
					url: uri
					}).done(function (xml) {
						var toReturn = {};
						toReturn['ref'] = $(xml).find("contextdata").attr('internalId');

						contactRef = toReturn.ref;
						NixxisDirectLink.setInternalId(contactRef);
						_Act_Manager.Prepare.setGlobal('KEY_PLUGIN', contactRef);
						NixxisScript.KEY_PLUGIN = contactRef;

					return true;

					}).fail(function (msg) {
						var message = "Error while processing request no records created: " + msg.status + ", " + msg.statusText;
						alert(message);
					return false;
				});

				return true;
			}

			else

			{
				return false;
			}

		},


		/**
		 * 	Set InternalID -  Links the ContactListId to the ContactID
		 *	@return	:	bool						True for executed properly and False for Error			
		**/
		SetInternalId: function () {

			NixxisScript.KEY_PLUGIN = _Act_Manager.Prepare.getGlobal('KEY_PLUGIN');
			var contactRef = NixxisScript.KEY_PLUGIN;

			var baseUri = NixxisScript.dataURI;
			var contactID = NixxisScript.contactId;

			_Pr._S.GlbVar['NixxisVar_contactID'] = { value: contactID, type: 'String' };

			if( (contactRef=='' || typeof(contactRef)=='undefined' || contactRef=='undefined') && (contactID=='' || typeof(contactID)=='undefined' || contactID=='undefined'))
			{

				alert('KEY_PLUGIN : ' + NixxisScript.KEY_PLUGIN + '\n' + 
				'contactID : ' + NixxisScript.contactId);

				return false;

			} 
			
			else 

			{

				//SetInternall Id on nixxis

				var uri = baseUri + "?action=setinternalid&contact=" + contactID + "&id=" + contactRef;

			$.ajax({
				type: "GET",
				dataType: "xml",
				url: uri
			}).done(function (xml) {
				//NixxisContactLink.contactlistId = contactRef;
				NixxisDirectLink.setInternalId(contactRef);
				var message = 'La fiche avec un id: "' + contactRef + '"  a été sélectée, veuillez patienter.';
				return true;

			}).fail(function (msg) {
				var message = "Error while processing request: " + msg.status + ", " + msg.statusText;
				alert(message);
				return false;
			});

			return true;
			};
			
		},


		/**
		 * 	Close Script
		 *			
		**/
		CloseScript: function () {
			//NixxisContactLink.commands.terminateContact();
			NixxisDirectLink.nextContact();
		},


		/**
		 * 	Close Script and Go Ready 
		 *			
		**/
		CloseScriptGoReady: function () {
			//NixxisContactLink.commands.terminateContactAndGoReady();
			NixxisDirectLink.nextContact();
		}

	},



	// Not yet Implemented

	// Agenda
	Agenda: {

		GetAgenda: function (date, time, area) {
			var rawAgendaList = NixxisContactLink.Agenda.getAgendaByContact(dateTime, area);
			//ToDo Parse
			//Return JSON
		},

		StoreAppointment: function (date, time, duration, description, area) {
			//ToDo convert date and time from objects

			NixxisContactLink.Agenda.storeAppointmentByContact(dateTime, duration, description, area);
		},

		CancelAppointment: function (Id, hasId) {
			if (hasId) {
				NixxisContactLink.Agenda.cancelAppointment();
			}
			else {
				NixxisContactLink.Agenda.cancelAppointmentById(id);
			}
		}

	},

	// Predefined Text
	PredefinedText: {
		GetPredefinedText: function () {
			var rawPredefList = NixxisContactLink.commands.getPredefinedTexts();
			//ToDo Parse
			//Return JSON
		},

		AddInsertText: function (isInsert, text) {
			if (isInsert) {
				NixxisContactLink.Email.InsertText(text);
			}
			else {
				NixxisContactLink.Email.AddText(text);
			}
		},

		ClearText: function () {
			NixxisContactLink.Email.ClearText();
		}

	}


};
