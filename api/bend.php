<?php 
header("Access-Control-Allow-Origin: *"); 
// header("Access-Control-Allow-Origin: https://findmeapriest.site"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Return 200 OK for preflight requests
    http_response_code(200);
    exit;
}

//PHPMailer
require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

//DEV
$config = json_decode(file_get_contents('http://localhost:3000/config_dev.json'), true);
// LIVE
//$config = json_decode(file_get_contents('/home/dh_8y5iqp/config.json'), true);

define ('CM_HOST', $config['CM_HOST']);
define ('CM_NAME', $config['CM_NAME']);
define ('CM_USER', $config['CM_USER']);
define ('CM_PASSWORD', $config['CM_PASSWORD']);
define ('CM_EMAIL_USER', $config['CM_EMAIL_USER']);
define ('CM_EMAIL_PASS', $config['CM_EMAIL_PASS']);
define ('CM_WEBSITE', $config['CM_WEBSITE']);
define ('REACT_APP_GOOGLE_API_KEY', $config['REACT_APP_GOOGLE_API_KEY']);



$receivedData = file_get_contents('php://input');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    log_info("Received: ".$receivedData);
    $data=json_decode($receivedData, true);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data['action'] = $_GET['action']; 
    $data['data'] = $_GET['data'];
}

// route depending on the contents of $data['action']

switch ($data['action']) {
    case 'register':
        registerUser($data);
        break;
    case 'verify':
        verifyUser($data);
        break;
    case 'login':
        loginUser($data);
        break;
    case 'forgotPassword':
        forgotValidate($data);
        break;
    case 'reset':
        validateReset($data);
        break;
    case 'changePassword':
        changePassword($data);
        break;
    case 'sendEmail':
        sendEmail($data);
        break;
    case 'updateprofile':
        updateProfile($data);
        break;
    case 'updateAvailability':
        updateAvailability($data);
        break;
    case 'getProfile':
        getProfile($data);
        break;
    case 'searchProfile':
        searchProfile($data);
        break;
    case 'getDistance':
        distanceCalc($data);
        break;
    case 'getPostcode':
        getPostCodeLatLong($data);
        break;
    case 'getGoogleDistance':
        getGoogleDistance($data);
        break;
    default:
        send_response([
            'status' => 'FAIL',
            'message' => 'Error - No route found for request: '. $data['action']
        ], 400);

}

function send_response ($response, $code = 200) {
    http_response_code($code);
    die(json_encode($response));
}  // send_response
function log_info($log) {
    $currentDirectory = "C:\Users\simon\Desktop\logs";
    $file=$currentDirectory.'\server.txt';
    $currentDateTime = date('Y-m-d H:i:s');
    file_put_contents($file, $currentDateTime.",".$log.chr(13), FILE_APPEND);
} // log_info

function generatePass($passLength) {
    $pass = '';
    $str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_0123456789@$';

    for ($i = 1; $i <= $passLength; $i++) {
        $char = mt_rand(0, strlen($str) - 1);
        $pass .= $str[$char];
    }

    return $pass;
} // generatePass

function loginUser($data) {
    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }

        $sql = "SELECT userPrivilege, userHash FROM fmap_user WHERE eMail=? AND passwordHash = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ss', $data['userName'], $data['passwordHash']);
        $stmt->execute();
        $result = $stmt->get_result();
        $conn->close();
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                if ($row['userPrivilege']<2) {
                    send_response([
                        'status' => 'FAIL',
                        'message' => 'You have not yet validated this<br>email and cannot login in until<br>you do. Check your eMail.'
                    ], 400);
                } else {
                    // $verify=
                    send_response([
                        'status' => 'SUCCESS',
                        'message' => $row['userHash']
                    ], 200);                   
                }
            }
        } else {
            send_response([
                'status' => 'FAIL',
                'message' => 'Login Failed'
            ], 400);
        }
        
} // user login
function registerUser($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }

            $sql = "INSERT INTO fmap_user (eMail, passwordHash, userPrivilege, userHash) VALUES (?,?,?,?)";

            $stmt = $conn->prepare($sql);

            $verify=generatePass(30); // let's make it really obscure!
            $stmt->bind_param('ssis', $data['userName'], $data['passwordHash'], $data['userPrivilege'], $verify);

            if ($stmt->execute()) {

                $conn->close();
                log_info("User Registration: SUCCESS ".$verify);
                send_response([
                    'status' => 'SUCCESS',
                    'message' => $verify,
                ],200);
            } else {
                log_info('Could not insert data');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not insert data'
                ], 400);
            }
} // register user

function verifyUser($data) {
    log_info('Verifying login with data:  '.$data);
    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }

            $verifiedStatus=2;
            $sql = "UPDATE fmap_user SET userPrivilege = ? WHERE userHash = ?";

            log_info($sql);
            log_info($verifiedStatus);
            log_info($data['data']);

            $stmt = $conn->prepare($sql);

            $stmt->bind_param('is', $verifiedStatus, $data['data']);

            if ($stmt->execute()) {

                $conn->close();
                send_response([
                    'status' => 'SUCCESS',
                    'message' => 'User has been verified',
                ],200);

                header('Location: '.CM_WEBSITE, true, 301);

            } else {
                log_info('Could not verify user with code '. $data['data']);
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not verify user with code '. $data['data']
                ], 400);
            }
}  // verifyUser

function forgotValidate($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }

            $sql = "UPDATE fmap_user SET userHash = ? WHERE eMail = ?";

            $stmt = $conn->prepare($sql);

            $verify=generatePass(30);
            $stmt->bind_param('ss', $verify, $data['userMail']);

            if ($stmt->execute()) {

                $conn->close();
                send_response([
                    'status' => 'SUCCESS',
                    'message' => $verify,
                ],200);
            } else {
                log_info('Could not insert data');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not insert data'
                ], 400);
            }


} // forgotValidate

function validateReset($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }
    
    $stmt = $conn->prepare("SELECT * FROM fmap_user WHERE userHash = ? ");
    $stmt->bind_param("s", $data['data']);
    $stmt->execute();
    $result = $stmt->get_result();
    $outp = $result->fetch_all(MYSQLI_ASSOC);

    if (count($outp) > 0) { 

        header("Location: ".CM_WEBSITE."?v=".$data['data'].'&hash='.md5($outp['userEmail']));
        exit();
    } else {
        //echo "No Match";
        header("Location: ".CM_WEBSITE."/");
        exit();
    }

} // validate reset


function changePassword($data) {
    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }

        $sql = "UPDATE fmap_user SET passwordHash = ? WHERE eMail = ?";

         $stmt = $conn->prepare($sql);

        $stmt->bind_param('ss', $data['passwordHash'], $data['userName']);

        if ($stmt->execute()) {

            $conn->close();
            send_response([
                'status' => 'SUCCESS',
                'message' => 'Password has been updated',
            ],200);

            header('Location: '.CM_WEBSITE, true, 301);

        } else {
            log_info('Could not update password.');
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not verify user with code '. $data['data']
            ], 400);
        }


}  // change Password

function sendEmail($data) {

$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug = 0; // Enable verbose debug output
    $mail->isSMTP(); // Set mailer to use SMTP
    $mail->Host = 'smtp.dreamhost.com'; // Specify main and backup SMTP servers
    $mail->SMTPAuth = true; // Enable SMTP authentication
    $mail->Username = CM_EMAIL_USER; // SMTP username
    $mail->Password = CM_EMAIL_PASS; // SMTP password or App Password
    $mail->SMTPSecure = 'ssl'; // Enable TLS encryption, `ssl` also accepted
    $mail->Port = 465; // TCP port to connect to

    //Recipients
    $mail->setFrom(CM_EMAIL_USER, 'Find me a Priest!');
    $mail->addAddress($data['To'], $data['To']); // Add a recipient

    // Content
    $mail->isHTML(true); // Set email format to HTML
    $mail->Subject = $data['Subject'];
    $mail->Body    = $data['Body'];
   
    $mail->send();
    send_response([
        'status' => 'SUCCESS',
        'message' => 'eMail sent to ' . $data['To']
    ],200);
} catch (Exception $e) {
    send_response([
        'status' => 'FAIL',
        'message' => 'eMail could not be sent. Error: ' . $mail->ErrorInfo
    ],200);
}
    

} // sendEmail

function getUserID($userHash) {
    // grab the userID from the fmap_user table
    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }
        $sql = "SELECT id from fmap_user WHERE userHash=?;";
        $stmt = $conn->prepare($sql);

        $stmt->bind_param('s', $userHash);

        $stmt->execute();
        $result = $stmt->get_result();
        $outp = $result->fetch_all(MYSQLI_ASSOC);
        $conn->close();

    if (count($outp) > 0) { 

        return $outp[0]['id'];
        
    } else {

        return 0;

    }
        
  

} // getUserID

function prepareParamList($data) {

    // iterate through $data, determine the type of each element and return
    // s - string i - integer d - double b - blob (boolean - no idea)

    $returnParam ="";

    foreach ($data as $element) {
        $type = gettype($element);
        switch ($type) {
            case "integer":
                $returnParam.='i';
                break;
            case "string":
                $returnParam.='s';
                break;
            case "boolean":
                $returnParam.='i';
                break;
            case "double":
                $returnParam.='d';
                break;
            case "object":
                $returnParam.='b';
                break;
        }
    }

    return $returnParam;

    } 


function updateProfile($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }



        $userID=getUserID($data['userHash']);


        if ($userID==0) {

            log_info('Could not find user');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not find user '
                ], 400);

        } else {

            $sql = "UPDATE fmap_profile SET userHash ='".$data['userHash']."',";
            $sql.= "                        profileTitle ='".$data['profileTitle']."',";
            $sql.= "                        profileFirstName ='".$data['profileFirstName']."',";
            $sql.= "                        profileSurname ='".$data['profileSurname']."', ";
            $sql.= "                        profileAddress1 ='".$data['profileAddress1']."', ";
            $sql.= "                        profileAddress2 ='".$data['profileAddress2']."', ";
            $sql.= "                        profileAddress3 ='".$data['profileAddress3']."', ";
            $sql.= "                        profileAddress4 ='".$data['profileAddress4']."', ";
            $sql.= "                        profilePostcode ='".$data['profilePostcode']."', ";
            $sql.= "                        profileHomePhone ='".$data['profileHomePhone']."', ";
            $sql.= "                        profileMobile ='".$data['profileMobile']."', ";
            $sql.= "                        profileEmail ='".$data['profileEmail']."', ";
            $sql.= "                        profileAvatar ='".$data['profileAvatar']."', ";
            $sql.= "                        profileGender ='".$data['profileGender']."', ";
            $sql.= "                        profileSeminary ='".$data['profileSeminary']."', ";
            $sql.= "                        profileOrdainedBy ='".$data['profileOrdainedBy']."', ";
            $sql.= "                        profilePTO ='".$data['profilePTO']."', ";
            $sql.= "                        profileWorship ='".$data['profileWorship']."', ";
            $sql.= "                        profileTradition ='".$data['profileTradition']."', ";
            $sql.= "                        profileRadius = ".$data['profileRadius'].", ";
            $sql.= "                        profileTravel = ".$data['profileTravel'].", ";
            $sql.= "                        profileFee = ".$data['profileFee'].", ";
            $sql.= "                        worshipScore = ".calculateValue($data['profileWorship'], "worship").", ";
            $sql.= "                        traditionScore = ".calculateValue($data['profileTradition'], "tradition").", ";
            $sql.= "                        ptoScore = ".calculateValue($data['profilePTO'], "pto")." ";
                      
            $sql.= "      WHERE userID = ".$userID.";";
            
            log_info($sql);

            $stmt = $conn->prepare($sql);

            if ($stmt->execute()) {

                $conn->close();
                send_response([
                    'status' => 'SUCCESS',
                    'message' => 'Profile Updated',
                ],200);

            } else {
                log_info('Could not update profile');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not update profile '
                ], 400);
            }
        };
}  // updateProfile

function updateAvailability($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }



        $userID=getUserID($data['userHash']);


        if ($userID==0) {

            log_info('Could not find user');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not find user '
                ], 400);

        } else {

            $sql = "        UPDATE fmap_profile SET userHash =?, userAvailability=? ";
            $sql=$sql."      WHERE userID=? ;";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param(
                'ssi',
                $data['userHash'], $data['userAvailability'], $userID
            );


            if ($stmt->execute()) {

                $conn->close();
                send_response([
                    'status' => 'SUCCESS',
                    'message' => 'Availability Updated',
                ],200);

            } else {
                log_info('Could not update profile');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not update availability'
                ], 400);
            }
        };
}  // updateAvailability

function getProfile($data) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }



        $userID=getUserID($data['userHash']);


        if ($userID==0) {

            log_info('Could not find user');
                send_response([
                    'status' => 'FAIL',
                    'message' => 'Could not find user '
                ], 400);

        } else {

            $sql =    "     SELECT * FROM fmap_profile ";
            $sql=$sql."     WHERE userID=? ;";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param(
                'i', $userID );


                $stmt->execute();
                $result = $stmt->get_result();
                $conn->close();
                if ($result->num_rows > 0) {
                        send_response([
                                'status' => 'SUCCESS',
                                'message' => json_encode($result->fetch_assoc())
                            ], 200);                   
                        }
                    }
                
}  // getUserID

function convertDateFormat($dateString) {
    $date = DateTime::createFromFormat('Y-m-d', $dateString);
    return $date->format('d/m/y');
}
function searchProfile($data) {

    // $searchPTO=json_decode($data['ptoRequired']);
    $searchTradition=json_decode($data['traditionRequired']);
    $searchWorship=json_decode($data['worshipRequired']);
    $searchDate=$data['dateRequired'];
    $searchRadius=$data['searchRadius'];
    $churchPostcode=$data['churchPostcode'];

    $results = matchCriteria($searchWorship, $searchTradition, $searchDate, $searchRadius, $churchPostcode);


    send_response([
        'status' => 'SUCCESS',
        'message' => $results,
    ], 200);                   

    
} // searchProfile


function getPostcodeData($postcode) {
    
    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
        if ($conn->connect_error) {
            log_info('Failure to connect to database: ' . $conn->connect_error);
            send_response([
                'status' => 'FAIL',
                'message' => 'Could not connect to database: ' . $conn->connect_error,
            ], 400);
        }

    $sql="SELECT * FROM postcode_geodata WHERE pcds=".json_encode($postcode).";";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    $conn->close();
    if ($result->num_rows > 0) {
            return $result->fetch_assoc();  
            }

}

function getPostcodeLatLong($data) {

$postcode=$data['postcode'];

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }

$sql="SELECT * FROM postcode_geodata WHERE pcds=".json_encode($postcode).";";

$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$conn->close();
if ($result->num_rows > 0) {
        send_response([
            'status' => 'SUCCESS',
            'message' => $result->fetch_assoc(),
        ], 200);             
    } else {
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not find that postcode: '.$postcode,
        ], 400);   
    }
}


function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $radiusOfEarth = 6371; // Earth's radius in kilometers.

    // Convert latitude and longitude from degrees to radians
    $lat1 = deg2rad($lat1);
    $lon1 = deg2rad($lon1);
    $lat2 = deg2rad($lat2);
    $lon2 = deg2rad($lon2);

    // Haversine formula
    $dLat = $lat2 - $lat1;
    $dLon = $lon2 - $lon1;
    $a = sin($dLat / 2) * sin($dLat / 2) + cos($lat1) * cos($lat2) * sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * asin(sqrt($a));
    $distance = $radiusOfEarth * $c;

    return $distance * 1.609;  // return miles
} // getPostcodeData

function distanceCalc($data) {

$postcode1 = $data['clergyPostcode'];
$postcode2 = $data['churchPostcode'];

$data1 = getPostcodeData($postcode1);

$data2 = getPostcodeData($postcode2);

if ($data1 && $data2) {
    $distance = calculateDistance($data1['lat'], $data1['long'], $data2['lat'], $data2['long']);
    // convert km to miles
    $distance=$distance/1.609;
    send_response([
        'status' => 'SUCCESS',
        'message' => round($distance, 2),
    ], 200);             
} else {
    send_response([
        'status' => 'FAIL',
        'message' => 'Could not calculate distance',
    ], 400);   
}
} // distancecalc


function calculateValue($choiceArray, $which) {

    $choiceArray=json_decode($choiceArray);


    if ($which === "tradition") {
        $sourceArray = [
            ['value' => 1, 'label' => 'Conservative Evangelical'],
            ['value' => 2, 'label' => 'Charismatic'],
            ['value' => 4, 'label' => 'Liberal Evangelical'],
            ['value' => 8, 'label' => 'Central Evangelical'],
            ['value' => 16, 'label' => 'Broad Church Traditon'],
            ['value' => 32, 'label' => 'Book of Common Prayer'],
            ['value' => 64, 'label' => 'Liberal Catholic'],
            ['value' => 128, 'label' => 'Traditional Catholic'],
            ['value' => 256, 'label' => 'Traditional Hymnody'],
            ['value' => 512, 'label' => 'Contemporary Worship Music'],
            ['value' => 1024, 'label' => 'Contemplative'],
            ['value' => 2048, 'label' => 'Alt.Worship']
        ];
        $totalValue = 0;
        foreach($choiceArray as $choiceLabel) {
            foreach($sourceArray as $sourceItem) {
                if ($sourceItem['label'] === $choiceLabel) {
                    $totalValue += $sourceItem['value'];
                    break; 
                }
            }
        }
        return $totalValue;
    }

    if ($which === "worship") {
        $sourceArray = [
            ['value' => 1, 'label' => 'Holy Communion/Eucharist/Mass'],
            ['value' => 2, 'label' => 'Eucharist with Baptism'],
            ['value' => 4, 'label' => 'Happy to preach'],
            ['value' => 8, 'label' => 'Happy to lead intercessions/prayers'],
            ['value' => 16, 'label' => 'Morning Prayer'],
            ['value' => 32, 'label' => 'Evening Prayer'],
            ['value' => 64, 'label' => 'All Age Worship'],
            ['value' => 128, 'label' => 'Free Worship'],
            ['value' => 256, 'label' => 'Baptism'],
            ['value' => 512, 'label' => 'Wedding'],
            ['value' => 1024, 'label' => 'Funeral'],
            ['value' => 2048, 'label' => 'Compline'],
            ['value' => 4096, 'label' => 'Taize'],
            ['value' => 8192, 'label' => 'Alt.Worship'],
            ['value' => 16384, 'label' => 'Benediction'],
            ['value' => 32768, 'label' => 'Incense']
        ];

        $totalValue = 0;
        foreach($choiceArray as $choiceLabel) {
            foreach($sourceArray as $sourceItem) {
                if ($sourceItem['label'] === $choiceLabel) {
                    $totalValue += $sourceItem['value'];
                    break; 
                }
            }
        }
        return $totalValue;
    }

    if ($which === "pto") {
        $sourceArray = [   
            ['value' => 1, 'label' => 'No PTO' ],
            ['value' => 2, 'label' => 'Bath and Wells' ],
            ['value' => 4, 'label' => 'Birmingham' ],
            ['value' => 8, 'label' => 'Blackburn' ],
            ['value' => 16, 'label' => 'Bristol' ],
            ['value' => 32, 'label' => 'Canterbury' ],
            ['value' => 64, 'label' => 'Carlisle' ],
            ['value' => 128, 'label' => 'Chelmsford' ],
            ['value' => 256, 'label' => 'Chester' ],
            ['value' => 512, 'label' => 'Chichester' ],
            ['value' => 1024, 'label' => 'Coventry' ],
            ['value' => 2048, 'label' => 'Derby' ],
            ['value' => 4096, 'label' => 'Durham' ],
            ['value' => 8192, 'label' => 'Ely' ],
            ['value' => 16384, 'label' => 'Exeter' ],
            ['value' => 32768, 'label' => 'Europe' ],
            ['value' => 65536, 'label' => 'Gloucester' ],
            ['value' => 131072, 'label' => 'Guildford' ],
            ['value' => 262144, 'label' => 'Hereford' ],
            ['value' => 524288, 'label' => 'Leeds' ],
            ['value' => 1048576, 'label' => 'Leicester' ],
            ['value' => 2097152, 'label' => 'Lichfield' ],
            ['value' => 4194304, 'label' => 'Lincoln' ],
            ['value' => 8388608, 'label' => 'Liverpool' ],
            ['value' => 16777216, 'label' => 'London' ],
            ['value' => 33554432, 'label' => 'Manchester' ],
            ['value' => 67108864, 'label' => 'Newcastle' ],
            ['value' => 134217728, 'label' => 'Norwich' ],
            ['value' => 268435456, 'label' => 'Oxford' ],
            ['value' => 536870912, 'label' => 'Peterborough' ],
            ['value' => 1073741824, 'label' => 'Portsmouth' ],
            ['value' => 2147483648, 'label' => 'Ripon and Leeds' ],
            ['value' => 4294967296, 'label' => 'Rochester' ],
            ['value' => 8589934592, 'label' => 'St Albans' ],
            ['value' => 17179869184, 'label' => 'St Edmundsbury and Ipswich' ],
            ['value' => 34359738368, 'label' => 'Salisbury' ],
            ['value' => 68719476736, 'label' => 'Sheffield' ],
            ['value' => 137438953472, 'label' => 'Sodor and Man' ],
            ['value' => 274877906944, 'label' => 'Southwark' ],
            ['value' => 549755813888, 'label' => 'Southwell and Nottingham' ],
            ['value' => 1099511627776, 'label' => 'Truro' ],
            ['value' => 2199023255552, 'label' => 'Wakefield' ],
            ['value' => 4398046511104, 'label' => 'Winchester' ],
            ['value' => 8796093022208, 'label' => 'Worcester' ],
            ['value' => 17592186044416, 'label' => 'York' ],
            ['value' => 35184372088832, 'label' => 'Bangor' ],
            ['value' => 70368744177664, 'label' => 'Llandaff' ],
            ['value' => 140737488355328, 'label' => 'Monmouth' ],
            ['value' => 281474976710656, 'label' => 'St Asaph' ],
            ['value' => 562949953421312, 'label' => 'St Davids' ],
            ['value' => 1125899906842624, 'label' => 'Swansea and Brecon' ],
            ['value' => 2251799813685248, 'label' => 'Aberdeen and Orkney' ],
            ['value' => 4503599627370496, 'label' => 'Argyll and The Isles' ],
            ['value' => 9007199254740992, 'label' => 'Brechin' ],
            ['value' => 18014398509481984, 'label' => 'Edinburgh' ],
            ['value' => 36028797018963968, 'label' => 'Glasgow and Galloway' ],
            ['value' => 72057594037927936, 'label' => 'Moray, Ross, and Caithness' ],
            ['value' => 144115188075855872, 'label' => 'St Andrews, Dunkeld and Dunblane' ],
            ['value' => 288230376151711744, 'label' => 'Armagh' ],
            ['value' => 576460752303423488, 'label' => 'Clogher' ],
            ['value' => 1152921504606846976, 'label' => 'Connor' ],
            ['value' => 2305843009213693952, 'label' => 'Derry and Raphoe' ],
            ['value' => 4611686018427387904, 'label' => 'Down and Dromore' ],
            ['value' => 9223372036854775808, 'label' => 'Kilmore, Elphin, and Ardagh' ],
            ['value' => 18446744073709551616, 'label' => 'Tuam, Killala, and Achonry' ],
            ['value' => 36893488147419103232, 'label' => 'Dublin and Glendalough' ],
            ['value' => 73786976294838206464, 'label' => 'Cashel, Ferns, and Ossory' ],
            ['value' => 147573952589676412928, 'label' => 'Cork, Cloyne, and Ross' ],
            ['value' => 295147905179352825856, 'label' => 'Limerick and Killaloe' ],
            ['value' => 590295810358705651712, 'label' => 'Meath and Kildare' ]
        ];

        $totalValue = 0;
        foreach($choiceArray as $choiceLabel) {
            foreach($sourceArray as $sourceItem) {
                if ($sourceItem['label'] === $choiceLabel) {
                    $totalValue += $sourceItem['value'];
                    break; 
                }
            }
        }
        return $totalValue;
    }
    

} // calculateValue

function matchCriteria($searchWorship, $searchTradition, $searchDate, $searchRadius, $churchPostcode) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
        log_info('Failure to connect to database: ' . $conn->connect_error);
        send_response([
            'status' => 'FAIL',
            'message' => 'Could not connect to database: ' . $conn->connect_error,
        ], 400);
    }

    // convert date to conform to database format of dd/mm/yyyy
    $date = new DateTime($searchDate);

    // Format the date to dd/mm/yyyy
    $formattedDate = $date->format('d/m/Y');

        $sql = "SELECT * FROM fmap_profile WHERE userAvailability LIKE '%".$formattedDate."%';";

        $stmt = $conn->prepare($sql);
        
        $stmt->execute();
        $result = $stmt->get_result();
        $conn->close();
        if ($result->num_rows > 0) {
            $found = [];
            while ($row = $result->fetch_assoc()) {

                        //now update the distance and duration (of travel) data
                        $row=getGoogleDistanceInternal($churchPostcode, $row);

                        $rowTradition = json_decode($row['profileTradition'], true);
                        $rowWorship = json_decode($row['profileWorship'], true);



                        $matchTradition = array_intersect($searchTradition, $rowTradition);
                        $matchWorship = array_intersect($searchWorship, $rowWorship);


                        // empty array imlies a complete wildcard 
                        if (empty($searchTradition)) {
                            $matchTradition = ["All Match"];
                        };

                        if (empty($searchWorship)) {
                            $matchWorship = ["All Match"];
                        };


                        log_info("rowTradition: ".json_encode($rowTradition));
                        log_info("matchTradition" . json_encode($matchTradition));

                        if (!empty($matchTradition) && !empty($matchWorship) ) {

                            // now exclude by search radius
                            if ($row['distanceValue'] <= ($searchRadius * 1609.34)) { // conversion to meters for comparison
                                   $found[] = $row;
                            }
                        } else {
                            // do nothing with this row
                        }

        } 

            // perform a sort on the whole $result dataset based upon the new 'distanceValue' element

            usort($found, function($a, $b) {
                return $a['distanceValue'] <=> $b['distanceValue'];
            });


        } else {
            return json_encode([]);
        }
        
        return json_encode($found);


} // match criteria

function getGoogleDistance($data) {

// Get origins and destinations from the query parameters
$origins = urlencode($data['origins']);
$destinations = urlencode($data['destinations']);
$apiKey=REACT_APP_GOOGLE_API_KEY;

// Google Maps API URL
$url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins={$origins}&destinations={$destinations}&key={$apiKey}";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute cURL session and get the response
$response = curl_exec($ch);

// Close cURL session
curl_close($ch);

$data = json_decode($response, true);

// print_r($data);
// die();

// Access the distance and duration text values
$distanceText = $data['rows'][0]['elements'][0]['distance']['text'];
$durationText = $data['rows'][0]['elements'][0]['duration']['text'];

// Output the results
// echo "Distance: " . $distanceText . "\n";
// echo "Duration: " . $durationText . "\n";
// die();

$response=['distance' => $distanceText,
           'duration' => $durationText];

send_response([
    'status' => 'SUCCESS',
    'message' => $response,
   ], 200);           


}

function getGoogleDistanceInternal($destination, $dataSet) {

    // Get origins and destinations from the query parameters
    $origins = urlencode($dataSet['profilePostcode']);
    $destinations = urlencode($destination);
    $apiKey=REACT_APP_GOOGLE_API_KEY;
    
    // Google Maps API URL
    $url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins={$origins}&destinations={$destinations}&key={$apiKey}";
    
    // Initialize cURL session
    $ch = curl_init();
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Execute cURL session and get the response
    $response = curl_exec($ch);
    
    // Close cURL session
    curl_close($ch);
    
    $data = json_decode($response, true);


    if ($data['rows'][0]['elements'][0]['status']==="OK") {
    // Access the distance and duration text values
    $distanceText = $data['rows'][0]['elements'][0]['distance']['text'];
    $distanceValue = $data['rows'][0]['elements'][0]['distance']['value'];
    $durationText = $data['rows'][0]['elements'][0]['duration']['text'];
      
    //update the array with these results
    
    $dataSet['distanceText'] = $distanceText;
    $dataSet['durationText'] = $durationText;
    $dataSet['distanceValue'] = $distanceValue;

    } else {

        $dataSet['distanceText'] = '';
        $dataSet['durationText'] = '';
        $dataSet['distanceValue'] = 999999999; // how else can I put this at the bottom of the list?

    }
      
    return $dataSet;
    
    }