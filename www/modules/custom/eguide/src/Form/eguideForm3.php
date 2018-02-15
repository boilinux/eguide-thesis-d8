<?php

namespace Drupal\eguide\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\Component\Serialization\Json;

/**
 * Class eguideForm.
 */
class eguideForm extends FormBase {


  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'eguide_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $coordinates = ['lat' => '10.318487', 'lon' => '123.925041'];
    $output = "";

    $uid = \Drupal::currentUser()->id();
    $query = 0;

    $nid = \Drupal::database()->query("SELECT nfd.nid FROM node_field_data AS nfd
      LEFT JOIN node__field_user_id AS nfui ON nfui.entity_id = nfd.nid
      LEFT JOIN node__field_access_status AS nfas ON nfas.entity_id = nfd.nid
      WHERE nfui.field_user_id_target_id = " . $uid . " AND nfas.field_access_status_value = 'ok'")->fetchField();

    $form['user_id'] = [
      '#type' => 'hidden',
      '#default_value' => $uid,
    ];

    $form['actions']['#type'] = 'actions';

    $check_python_running = exec("ps -e | grep python");
    if (!empty($check_python_running)) {

      $form['button_screenshot'] = [
        '#markup' => "<h2>The system is busy. Please try again later.</h2><div id='container'><a href='/eguide/form' class='btn btn-primary'>Refresh page.</a></div>",
      ];
    }
    else if (!empty($nid)) {

      $query_vehicle = \Drupal::database()->query("SELECT nfri.field_route_icon_target_id AS icon_tid, nrdv.field_route_description_value AS description, nfr.field_route_value AS route, nfd.nid AS vehicle_id,nfd.title AS title FROM node_field_data AS nfd
        LEFT JOIN node__field_route_icon AS nfri ON nfri.entity_id = nfd.nid
        LEFT JOIN node__field_route_description AS nrdv ON nrdv.entity_id = nfd.nid
        LEFT JOIN node__field_route AS nfr ON nfr.entity_id = nfd.nid
        WHERE nfd.type = 'vehicle'")->fetchAll();
      $li = "";

      foreach ($query_vehicle as $data) {
        $file = \Drupal\file\Entity\File::load($data->icon_tid);
        $path = file_create_url($file->getFileUri());

        $json_route = Json::decode($data->route);

        $form['#attached']['drupalSettings']['eguide']['eguide_generate_route_map']['data'][] = [
          'v_id' => $data->vehicle_id,
          'icon' => $path,
          'route' => $json_route,
        ];

        $form['#attached']['drupalSettings']['eguide']['eguide_generate_route_map']['data2'] = $coordinates;

        $li .= "<li class='destination' data-lon='" . $json_route[0]['lon'] . "' data-lat='" . $json_route[0]['lat'] . "'><span><img src='" . $path . "'/> - </span><span>" . $data->title . "</span> <span>" . $data->description . "</span></li>";
      }

      // do the mapping
      $form['#attached']['library'][] = 'eguide/eguide_generate_route_map';

      $output .= "<div><p class='map-destinace'>Calculated distance is <span class='distance-value'>0</span>km</p></div>";

      $output .= "<ul>" . $li . "</ul>";

      $form['node_id'] = [
        '#type' => 'hidden',
        '#default_value' => $nid,
      ];

      $form['button_screenshot'] = [
        '#markup' => "<div id='container-screenshot'><a href='#' id='edit-print' class='use-ajax btn btn-info'>Print</a></div><div id='map-container'><div id='map_canvas2'></div>" . $output . "</div>",
      ];

    }
    else {
      $form['actions']['insert_coin_bill'] = [
        '#type' => 'submit',
        '#value' => $this->t('Insert Coin/Bill'),
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    $uid = $form_state->getValue('user_id');
    $username = \Drupal::database()->query("SELECT name FROM users_field_data WHERE uid = " . $uid)->fetchField();

    if ($form_state->getValue('op') == 'Insert Coin/Bill') {

      exec("python " . $_SERVER['DOCUMENT_ROOT'] . "/arduino_connect.py " . $username . " " . $uid);

    }

    return;
  }

}
