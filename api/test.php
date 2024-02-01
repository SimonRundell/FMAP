<?

// https://findmeapriest.local/api/test.php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

define ('CM_HOST', 'localhost:10011');
define ('CM_NAME', 'local');
define ('CM_USER', 'root');
define ('CM_PASSWORD', 'root');
define ('CM_EMAIL_USER', 'simon@codemonkey.design');
define ('CM_EMAIL_PASS', 'f3oHCjb7');

function processScores($searchPTO, $searchWorship, $searchTradition) {

    $conn = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn->connect_error) {
       // error trapping within bend here
    }

        $sql = "SELECT * FROM fmap_profile;";

        $stmt = $conn->prepare($sql);
        
        $stmt->execute();
        $result = $stmt->get_result();
        $conn->close();
        if ($result->num_rows > 0) {
            $found = [];
            while ($row = $result->fetch_assoc()) {
                $rowTradition = json_decode($row['profileTradition'], true);
                $rowWorship = json_decode($row['profileWorship'], true);
                $rowPTO = json_decode($row['profilePTO'], true);
        
                $matchTradition = array_intersect($searchTradition, $rowTradition);
                $matchWorship = array_intersect($searchWorship, $rowWorship);
                $matchPTO = array_intersect($searchPTO, $rowPTO);
        
                // Check if any intersection is not empty
                if (!empty($matchTradition) || !empty($matchWorship) || !empty($matchPTO)) {
                    $found[] = $row;
                }
            }
        } else {
            echo "No records found";
        }
        
        echo "Search Results: found " . count($found) . " records";


} // processScores

function writetoTable($id, $worshipScore, $traditionScore, $ptoScore) {

    $conn2 = new mysqli(CM_HOST, CM_USER, CM_PASSWORD, CM_NAME);
    if ($conn2->connect_error) {
       echo 'Failure to connect to database: ' . $conn2->connect_error;
    }


        $sql = "UPDATE fmap_profile SET ";
        $sql.= "   worshipScore = ".$worshipScore.", ";
        $sql.= "   traditionScore = ".$traditionScore.", ";
        $sql.= "   ptoScore = ".$ptoScore." WHERE id = ".$id.";";
        
        $stmt = $conn2->prepare($sql);
        $stmt->execute();
        echo "Database updated<br>";

        $conn2->close();

} // writetoTable
        

    

function calculateValue($choiceArray, $which) {


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
                    break; // Found the match, no need to continue inner loop
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
                    break; // Found the match, no need to continue inner loop
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
                    break; // Found the match, no need to continue inner loop
                }
            }
        }
        return $totalValue;
    }
    

}

echo "<h1>Processng Data...</h1>";

processScores();

