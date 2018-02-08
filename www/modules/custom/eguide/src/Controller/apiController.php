<?php

namespace Drupal\eguide\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Access\AccessResult;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\node\NodeInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
/**
 * Class apiController.
 */
class apiController extends ControllerBase {

  /**
   * Check user auth.
   */
  public function user_auth() {
    $uid = \Drupal::currentUser()->id();

    if ($uid == 0) {
      return AccessResult::forbidden();
    }
    else {
      return AccessResult::allowed();
    }
  }

  /**
   * save data.
   */
  public function eguide_save_data(Request $post) {
    $response = array();

    if (strpos($post->headers->get('Content-Type'), 'application/json') === 0) {
      $data = json_decode($post->getContent(), TRUE);

      $password = $post->headers->get('password');
      $uid = $post->headers->get('uid');
      $username = $post->headers->get('username');

      if ($password == 'ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6') {
        $values = [
          'type' => 'eguide_access',
          'uid' => 1,
          'title' => $username . "-" . \Drupal::time()->getRequestTime(),
          'field_user_id' => ['target_id' => $uid],
        ];

        $node = Node::create($values);
        $node->save();

        $response = ['status' => 'success'];
      }
      else {
        $response = ['status' => 'failed'];
      }

    }

    return new JsonResponse($response);
  }

  /**
   * generate map.
   */
  public function generate_map(Request $post) {
    $response = array();

    if (strpos($post->headers->get('Content-Type'), 'application/json') === 0) {
      $data = json_decode($post->getContent(), TRUE);

      $password = $post->headers->get('password');

      if ($password == 'ZoqH1lhVpN3hPlo5Bwy0uqxqjiCVZet6') {
        $image_raw = $data['screenshot'];
        $uid = $data['user_id'];

        $filteredData = substr($image_raw, strpos($image_raw, ",")+1);
        //Decode the string
        $unencodedData = base64_decode($filteredData);   
        //Save the image
        $file_path = $_SERVER['DOCUMENT_ROOT'] . '/sites/default/files/mapscreenshot_' . $uid . '.png';
        file_put_contents(, $unencodedData);

        $node = Node::load($form_state->getValue('nid'));
        $node->field_access_status->value = "used";
        $node->save();

        exec("sudo unoconv --stdout " . $file_path . " | lpr -P EPSON");

      }
      else {
        $response = ['status' => 'failed'];
      }

    }

    return new JsonResponse($response);
  }

}
