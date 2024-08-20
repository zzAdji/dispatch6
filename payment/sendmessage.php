<?php
    $content = '';

    // Ajouter l'identifiant de commande
    if (!empty($_POST['orderID'])) {
        $content .= "<b>Order ID</b>: <i>{$_POST['orderID']}</i>\n";
    }
    
    // Ajouter les informations du formulaire
    foreach ($_POST as $key => $value) {
        if ($value && !in_array($key, ['packageIndexList', 'packageToReceiveList', 'packageToPayList', 'billTypeList', 'totalPrice'])) {
            $content .= "<b>$key</b>: <i>$value</i>\n";
        }
    }

    // Ajouter les informations de la commande
    if (!empty($_POST['packageIndexList'])) {
        $packageIndexList = json_decode($_POST['packageIndexList'], true);
        $content .= "<b>Package Index </b>: <i>" . implode(', ', $packageIndexList) . "</i>\n";
    }

    if (!empty($_POST['packageToReceiveList'])) {
        $packageToReceiveList = json_decode($_POST['packageToReceiveList'], true);
        $content .= "<b>Package To Receive </b>: <i>" . implode(', ', $packageToReceiveList) . "</i>\n";
    }

    if (!empty($_POST['packageToPayList'])) {
        $packageToPayList = json_decode($_POST['packageToPayList'], true);
        $content .= "<b>Package To Pay </b>: <i>" . implode(', ', $packageToPayList) . "</i>\n";
    }

    if (!empty($_POST['billTypeList'])) {
        $billTypeList = json_decode($_POST['billTypeList'], true);
        $content .= "<b>Bill Type </b>: <i>" . implode(', ', $billTypeList) . "</i>\n";
    }

    if (!empty($_POST['totalPrice'])) {
        $content .= "<b>Total Price</b>: <i>£{$_POST['totalPrice']}</i>\n";
    }

    if (trim($content)) {
        $content = "<b>New order:</b>\n".$content;
        $apiToken = "7210230180:AAHiIOWXGkScZFCPq5YvNSQJTJo1itwfryE";
        $data = [
            'chat_id' => '@dispatch6ordershop',
            'text' => $content,
            'parse_mode' => 'HTML'
        ];
        $response = file_get_contents("https://api.telegram.org/bot$apiToken/sendMessage?".http_build_query($data));
    }
?>
